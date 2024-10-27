export declare function getProjectRootPath(): string;
export declare function getAbsolutePathForProjectDirectory(projectDirectory: string): string;
export declare function splitStringIntoSet<CollectionElementT>(stringList: string | null | undefined, transform: (value: string) => CollectionElementT): Set<CollectionElementT>;
