import type { Request } from "express";

export interface PaginationQuery {
  cursor?: string;
  limit?: number | string;
  direction?: "forward" | "backward";
}

export interface PaginateOptions<WhereInput = any, OrderByInput = any> {
  where?: WhereInput;
  orderBy?: OrderByInput;
  include?: any;
  select?: any;
  cursor?: string;
  limit?: number | string;
  direction?: "forward" | "backward";
  cursorField?: string;
  req?: Request;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    previousCursor: string | null;
    nextUrl: string | null;
    previousUrl: string | null;
  };
}

export interface PrismaModelDelegate<T> {
  findMany(args: any): Promise<T[]>;
}

function buildUrl(req: Request, params: Record<string, string | number | undefined | null>): string {
  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost";
  const fullPath = req.originalUrl || `${req.baseUrl}${req.path}`;
  const url = new URL(`${protocol}://${host}${fullPath}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/**
 * Reusable cursor-based pagination for Prisma models.
 * Supports forward and backward pagination with nextUrl and previousUrl generation.
 */
export async function paginate<T extends Record<string, any>>(
  model: PrismaModelDelegate<T>,
  options: PaginateOptions = {}
): Promise<PaginatedResult<T>> {
  const {
    where,
    orderBy,
    include,
    select,
    cursor,
    limit,
    direction = "forward",
    cursorField = "id",
    req,
  } = options;

  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const isBackward = direction === "backward";

  const take = isBackward ? -(limitNum + 1) : limitNum + 1;

  const findManyArgs: any = {
    where,
    include,
    select,
    orderBy: orderBy ?? { [cursorField]: "desc" },
    take,
  };

  if (cursor) {
    findManyArgs.cursor = { [cursorField]: cursor };
    findManyArgs.skip = 1;
  }

  let items: T[] = await model.findMany(findManyArgs);

  let hasMore = false;
  if (isBackward) {
    if (items.length > limitNum) {
      hasMore = true;
      items = items.slice(1);
    }
  } else {
    if (items.length > limitNum) {
      hasMore = true;
      items = items.slice(0, limitNum);
    }
  }

  let nextCursor: string | null = null;
  let previousCursor: string | null = null;

  if (items.length > 0) {
    const firstItem = items[0]!;
    const lastItem = items[items.length - 1]!;

    if (isBackward) {
      previousCursor = hasMore ? firstItem[cursorField] : null;
      nextCursor = lastItem[cursorField];
    } else {
      nextCursor = hasMore ? lastItem[cursorField] : null;
      previousCursor = cursor ? firstItem[cursorField] : null;
    }
  }

  let nextUrl: string | null = null;
  let previousUrl: string | null = null;

  if (req) {
    if (nextCursor) {
      nextUrl = buildUrl(req, {
        cursor: nextCursor,
        limit: limitNum,
        direction: "forward",
      });
    }

    if (previousCursor) {
      previousUrl = buildUrl(req, {
        cursor: previousCursor,
        limit: limitNum,
        direction: "backward",
      });
    }
  }

  return {
    data: items,
    pagination: {
      nextCursor,
      previousCursor,
      nextUrl,
      previousUrl,
    },
  };
}
