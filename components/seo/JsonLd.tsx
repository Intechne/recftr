import { headers } from "next/headers";

export default async function JsonLd({ data }: { data: object | object[] }) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const list = Array.isArray(data) ? data : [data];
  return <>{list.map((d, i) => <script key={i} nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />)}</>;
}
