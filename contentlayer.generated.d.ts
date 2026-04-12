declare module "contentlayer/generated" {
  export type DataExports =
    import("./.contentlayer/generated/types").DataExports;
  export type DocumentTypes =
    import("./.contentlayer/generated/types").DocumentTypes;
  export type Page = import("./.contentlayer/generated/types").Page;
  export type Project = import("./.contentlayer/generated/types").Project;

  export const allPages: Page[];
  export const allProjects: Project[];
  export const allDocuments: DocumentTypes[];
}
