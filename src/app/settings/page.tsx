"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMode } from "@/hooks/useMode";
import Link from "next/link";
import React, { useState } from "react";

export default function SettingsPage() {
  const { data: modeData, mutate } = useMode();
  const [state, setState] = useState("unauthorized");
  const [code, setCode] = useState("");

  const handleManagement = async () => {
    if (code === "") {
      alert("管理者コードを入力してください。");
      return;
    }

    const response = await fetch("/api/management", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(code),
    });

    const data = await response.json();

    console.log({ data });

    if (data.success) {
      alert("管理者コードが一致します。");
      setState("authorized");
    } else if (data.success === false) {
      alert("管理者コードが一致しません。");
      return;
    }
  };

  const handleVacationMode = async (mode: string) => {
    const response = await fetch("/api/mode", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(mode),
    });

    const data = await response.json();

    console.log({ data });

    mutate();

    if (data.success) {
      alert(`${mode}モードに変更しました。`);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      {state === "unauthorized" && (
        <div className="flex flex-col gap-y-4 items-center border p-8 rounded-xl shadow-lg">
          <Label htmlFor="name" className="text-center font-bold text-lg">
            管理者コード
          </Label>
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
          />
          <Button className="w-full cursor-pointer" onClick={handleManagement}>
            確認
          </Button>
        </div>
      )}
      {state === "authorized" && (
        <div className="flex flex-col gap-y-4">
          {modeData && modeData.mode.mode === "休み" && (
            <Button onClick={() => handleVacationMode("通常")}>
              通常モードに変更
            </Button>
          )}

          {modeData && modeData.mode.mode === "通常" && (
            <Button onClick={() => handleVacationMode("休み")}>
              長期休みモードに変更
            </Button>
          )}

          <Button variant={"link"} asChild>
            <Link href={"/"}>戻る</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
