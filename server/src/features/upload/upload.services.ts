import ImageKit from 'imagekit';
import { getImageKitConfig } from '../settings/settings.services';

export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

async function getImageKitInstance(): Promise<ImageKit | null> {
  const config = await getImageKitConfig();
  if (!config.publicKey || !config.privateKey || !config.urlEndpoint) {
    return null;
  }
  return new ImageKit({
    publicKey: config.publicKey,
    privateKey: config.privateKey,
    urlEndpoint: config.urlEndpoint,
  });
}

export async function uploadImage(
  fileBuffer: Buffer,
  fileName: string
): Promise<UploadResult> {
  const imageKit = await getImageKitInstance();
  if (!imageKit) {
    throw new Error('ImageKit not configured');
  }

  const result = await imageKit.upload({
    file: fileBuffer,
    fileName,
    folder: '/workboard',
  });

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
  };
}

export async function deleteImage(fileId: string): Promise<void> {
  const imageKit = await getImageKitInstance();
  if (!imageKit) {
    throw new Error('ImageKit not configured');
  }
  await imageKit.deleteFile(fileId);
}
