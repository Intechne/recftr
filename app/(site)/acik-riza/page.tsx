import LegalDocument from "@/components/public/LegalDocument";
import {pageMeta} from "@/lib/seo";
import {legalDocument} from "@/lib/legal-documents";
const document=legalDocument('acik-riza')!;
export const metadata=pageMeta({title:document.title,description:document.description,path:"/acik-riza"});
export default function Page(){return <LegalDocument slug="acik-riza"/>;}
