import Calendar from "@/components/Calendar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Calendar />
      <div className="flex justify-center">
        <Button asChild>
          <Link href={"/settings"}>設定(管理者)</Link>
        </Button>
      </div>
    </>
  );
}
