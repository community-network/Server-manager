declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg";
declare module "*useResponsiveLoader=true" {
  const value: {
    srcSet: string;
    src: string;
    placeholder: string;
    height: number;
    width: number;
  };
  export default value;
}
