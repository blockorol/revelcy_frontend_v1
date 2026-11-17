import type { RequestOptions } from "./http";
import premarketList from "./mockData/premarketList.json";
import lilpupsMainInfo from "./mockData/lilpupsMainInfo.json";
import lilpupsDynamicInfo from "./mockData/lilpupsDynamicInfo.json";
import hopeMainInfo from "./mockData/hopeMainInfo.json";
import hopeDynamicInfo from "./mockData/hopeDynamicInfo.json";
import mostroMainInfo from "./mockData/mostroMainInfo.json";
import mostroDynamicInfo from "./mockData/mostroDynamicInfo.json";

const premarkets = [
  { main: lilpupsMainInfo, dynamic: lilpupsDynamicInfo },
  { main: hopeMainInfo, dynamic: hopeDynamicInfo },
  { main: mostroMainInfo, dynamic: mostroDynamicInfo },
];

export function mockServerError(): never {
  throw Object.assign(new Error("Revelcy is paused"), {
    status: 503,
    details: { message: "Revelcy is paused", code: "maintenance_mode" },
  });
}

function notFound(): never {
  throw Object.assign(new Error("Not found in the public snapshot"), {
    status: 404,
    details: { message: "Not found in the public snapshot", code: "not_found" },
  });
}

export async function mockRequest<T>(url: string, opts: RequestOptions): Promise<T> {
  if (opts.signal?.aborted) throw new DOMException("The request was aborted", "AbortError");

  const { pathname, searchParams } = new URL(url, "https://snapshot.invalid");
  if ((opts.method ?? "GET") !== "GET" || pathname.startsWith("/auth/")) {
    mockServerError();
  }

  const premarketId = searchParams.get("premarket_id");
  const premarketName = searchParams.get("premarket_name")?.toLowerCase();
  switch (pathname) {
    case "/premarket/get_list": {
      const cursor = Math.max(0, Number(searchParams.get("cursor") ?? 0));
      const limit = Math.max(0, Number(searchParams.get("limit") ?? premarketList.total));
      return {
        ...premarketList,
        premarkets: premarketList.premarkets.slice(cursor, cursor + limit),
      } as T;
    }
    case "/premarket/get_main_info": {
      const market = premarkets.find(({ main }) =>
        premarketId
          ? main.blockchain_info.premarket_address === premarketId
          : main.availability_info.token_short_url_name === premarketName
      );
      return (market?.main ?? notFound()) as T;
    }
    case "/premarket/get_dynamic_info": {
      const market = premarkets.find(({ main }) => main.blockchain_info.premarket_address === premarketId);
      return (market?.dynamic ?? notFound()) as T;
    }
    default:
      return notFound();
  }
}
