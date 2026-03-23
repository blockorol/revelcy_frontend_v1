import { validateImageFile, uriToFile, BANNER_MAX_FILE_SIZE_BYTES } from "@utils/imageValidation";
import { uploadImage } from "@api/files";
import { updateAboutCommunity } from "@api/token";
import { NoticeOptions } from "@providers/NotificationContext";


export interface CommunityLink {
    text: string;
    url: string;
    type: "x" | "tg" | "other";

}

export interface AddCommunityInfoParams {
    banner?: {
        data?: string;
        url?: string;
    }
    description?: string;
    links?: CommunityLink[];
}
type ErrorNotifier = (message: string, options?: Omit<NoticeOptions, "type"> | undefined)=>void 


export async function addCommunityInfo(premarketPubkey: string, params:AddCommunityInfoParams, notifyError?: ErrorNotifier) {
    try {
        let bannerURL: string | undefined;
        if (params.banner?.url) {
            bannerURL = params.banner.url;
        } else if (params.banner?.data !== undefined) {
            bannerURL = await uploadBanner(premarketPubkey, params.banner.data, notifyError);
        }

        await updateAboutCommunity(premarketPubkey, {
                description: params.description ?? "",
                tokenBannerURL: bannerURL,
                links: params.links,
                });
    } catch (e) {
        console.error("[addCommunityInfo] failed", {
            premarketPubkey,
            params,
            error: e,
        });
        notifyError?.("failed to add community info", {
            suggest: "Please, add it again from premarket page",
            duration: 60000,
            action: {
              label: "Ok",
              onAction: () => {},
            },
          });
        throw e;
    }
    /*
        notify.error(, {
        suggest: "Please, select a PNG or JPEG image under 5 MB",
        duration: 60000,
        action: {
            label: "Ok",
            onAction: () => {},
        },
        });
        return null;
    */
}

async function uploadBanner(premarketPda: string, bannerData: string, notifyError?: ErrorNotifier): Promise<string|undefined> {
    try {
        const validationError = await validateImageFile(bannerData, { maxSizeBytes: BANNER_MAX_FILE_SIZE_BYTES });
        if (validationError) {
            console.log(`failed to upload community banner:`, validationError.message)
            notifyError?.(
                `Failed to upload community banner`, {
                    suggest: "Please, select a PNG or JPEG image under 5 MB",
                    duration: 60000,
                    action: {
                        label: "Ok",
                        onAction: () => {},
                    },
                }
            )
            return undefined
        }
        
        const fileName = `${premarketPda}_banner`;
        const file = await uriToFile(bannerData, fileName);
        const path = await uploadImage(file, fileName);
        return path
    } catch {
        notifyError?.("Failed to upload community banner", {
            suggest: "Please, add it again from premarket page",
            duration: 60000,
            action: {
            label: "Ok",
            onAction: () => {},
            },
        });
        return undefined
    }
}
