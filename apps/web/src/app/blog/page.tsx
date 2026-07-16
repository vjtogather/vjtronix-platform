import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/SiteShell";
import { PlatformPageTemplate } from "@/components/sections/PlatformPageTemplate";
import { getPlatformPage } from "@/data/platform-pages";

const page = getPlatformPage("blog");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function BlogPage() {
  return (
    <SiteShell>
      <PlatformPageTemplate page={page} />
    </SiteShell>
  );
}
