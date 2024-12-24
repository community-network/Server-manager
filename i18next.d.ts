// import the original type declarations
import "i18next";
// import all namespaces (for the default language, only)
import common from "./src/locales/languages/en-US.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: "common";
    // custom resources type
    resources: {
      common: typeof common;
    };
    // other
  }
}
