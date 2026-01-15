import { Metadata } from "next";

interface MetadataProps {
  title: string;
  description?: string;
  image?: string;
  icons?: Metadata["icons"];
  noIndex?: boolean;
  type?: "website" | "article";
}

const defaultMetadata = {
  title: "JFS Wears | Premium Nigerian Fashion",
  description: "Elevate your style with JFS Wears. The best in modern Nigerian fashion.",
  siteName: "JFS Wears",
  twitterHandle: "@jfswears",
  url: "https://jfs-wears.com", // Valid production URL or env var
};

export function constructMetadata({
  title,
  description = defaultMetadata.description,
  image = "/opengraph-image",
  icons = "/logo.png",
  noIndex = false,
  type = "website",
}: MetadataProps): Metadata {
  return {
    title: {
      template: `%s | ${defaultMetadata.siteName}`,
      default: defaultMetadata.title,
      absolute: title.includes("|") ? title : `${title} | ${defaultMetadata.siteName}`,
    },
    description,
    openGraph: {
      title,
      description,
      url: defaultMetadata.url,
      siteName: defaultMetadata.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_NG",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: defaultMetadata.twitterHandle,
    },
    icons,
    metadataBase: new URL(defaultMetadata.url),
    alternates: {
      canonical: "./",
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
