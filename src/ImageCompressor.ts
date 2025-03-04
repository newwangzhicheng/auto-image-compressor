import sharp from 'sharp';
class ImageCompressor {
    private options: sharp.SharpOptions;
    constructor() {
       this.options = {
        limitInputPixels: false
       };
       sharp.cache(false);
    }
    /**
     * 压缩图片，会替换图片
     * @param input 图片路径
     * @param output 压缩后的图片路径
     */
    async compress(input: string, output: string) {
       const image = sharp(input, this.options);
       const metadata = await image.metadata();
       await image.toFormat(metadata.format as keyof sharp.FormatEnum, {
        quality: 80
       }).toFile(output);
    }
}

export default ImageCompressor; 