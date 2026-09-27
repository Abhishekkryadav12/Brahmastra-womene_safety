import { LucideIcon, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmergencyCardProps {
  title: string;
  number: string;
  icon: LucideIcon;
}

const EmergencyCard = ({ title, number, icon: Icon }: EmergencyCardProps) => {
  return (
    <Card className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-medium overflow-hidden">
      <a href={`tel:${number}`} className="block w-full h-full cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <Icon className="h-6 w-6 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{title}</h4>
            <p className="text-sm opacity-90">{number}</p>
          </div>
          <Phone className="h-5 w-5 opacity-80 shrink-0" />
        </CardContent>
      </a>
    </Card>
  );
};

export default EmergencyCard;
