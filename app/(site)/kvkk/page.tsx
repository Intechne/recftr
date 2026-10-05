import LegalDocument from "@/components/public/LegalDocument";
import {pageMeta} from "@/lib/seo";
import {legalDocument} from "@/lib/legal-documents";
const document=legalDocument('kvkk')!;
export const metadata=pageMeta({title:document.title,description:document.description,path:"/kvkk"});
export default function Page(){return <LegalDocument slug="kvkk"/>;}
