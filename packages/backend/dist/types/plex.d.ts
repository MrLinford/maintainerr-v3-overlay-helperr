export interface PlexPhoto {
    ratingKey?: string;
    key?: string;
    selected?: string | boolean;
    thumb?: string;
}
export interface PlexMetadataItem {
    ratingKey: string;
    type: string;
    thumb?: string;
    art?: string;
    title?: string;
}
export interface PlexCollection {
    ratingKey: string;
    title: string;
    librarySectionID: string;
}
//# sourceMappingURL=plex.d.ts.map