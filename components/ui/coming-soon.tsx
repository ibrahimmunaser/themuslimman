import { Construction } from "lucide-react";
import { EmptyState } from "./empty-state";

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <EmptyState icon={Construction} title={title} description={description} />
    </div>
  );
}
