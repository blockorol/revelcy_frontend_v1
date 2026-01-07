import type { ClientContext } from "./types";
import type { ClientContextDTO } from "./dto";
import { http } from "@services/api/http"; // твой http wrapper (как в userOutOfPremarket)
import { API_HOST } from "env"; // поправь пути
import type { UserInfoEventType, UserSetInfoRequestDTO, UserSetInfoResponseDTO } from "./dto";
import { collectClientContextWeb } from "./collector";

type Args = {
  eventType: UserInfoEventType;
  premarket?: string;
  userId?: string;
};

export async function userSetAdditionalInfo(args: Args): Promise<void> {
    try {
        const ctx = await collectClientContextWeb({ includeUA: true });
        const client = mapClientContextToDTO(ctx, args.userId);

        const payload: UserSetInfoRequestDTO = {
            event_type: args.eventType,
            client_timestamp_ms: ctx.capturedAtMs,
            premarket: args.premarket,
            client,
        };

        await http.post(`${API_HOST}/user/set_additional_info`, {json: payload, retry: 1,});
    } catch (e: any) {
        // без UI-нотификаций, просто лог
        console.log("[fingerprint] failed user_set_additional_info", {
        eventType: args.eventType,
        premarket: args.premarket,
        error: e?.message ?? e,
        });
    }
}



export function mapClientContextToDTO(ctx: ClientContext, userId?: string): ClientContextDTO {
  return {
    user_id: userId,
    user_agent: ctx.userAgent,
    language: ctx.locale,
    languages: ctx.languages,
    timezone: ctx.timezone,
    locale: ctx.locale,

    screen_width: ctx.screen?.w,
    screen_height: ctx.screen?.h,
    pixel_ratio: ctx.pixelRatio,

    // главное: install id
    install_id: ctx.installId,
    install_id_source: ctx.installIdSource,

    // wallet / phantom
    phantom_version: undefined, // если позже достанешь реально — подставим
  };
}
