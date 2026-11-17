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
        // if banner.url exist -> set url, if not -> uploadBanner with banner.data (if exist)
        const bannerURL = params.banner
            ? params.banner.url??
                params.banner.data === undefined ? undefined
                : await uploadBanner(premarketPubkey, params.banner.data, notifyError)
            : undefined

        await updateAboutCommunity(premarketPubkey, {
                description: params.description ?? "",
                tokenBannerURL: bannerURL,
                links: params.links,
                });
    } catch {
        notifyError?.("failed to add community info", {
            suggest: "Please, add it again from premarket page",
            duration: 60000,
            action: {
              label: "Ok",
              onAction: () => {},
            },
          });
        return
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