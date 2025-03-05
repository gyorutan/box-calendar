"use client";

import { DateSelectArg, EventClickArg, DateSpanApi } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { dateFormatting } from "@/helper/dateFormatting";
import { useReservation } from "@/hooks/useReservations";
import { Loader2 } from "lucide-react";
import { Reservation } from "@prisma/client";
import { useMode } from "@/hooks/useMode";

const Calendar = () => {
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);

  const [bandName, setBandName] = useState("");
  const [password, setPassword] = useState("");

  const { data, isLoading, mutate } = useReservation();
  console.log(data && data);

  const { data: modeData } = useMode();

  console.log(modeData && modeData);

  // FullCalendar에 맞게 데이터 변환
  const events =
    data &&
    data.reservations.map((reservation: Reservation) => ({
      id: reservation.id,
      title: reservation.bandName, // ✅ bandName을 title로 설정
      start: reservation.start,
      end: reservation.end,
      allDay: reservation.allDay,
    }));

  const handleDateClick = (selected: DateSelectArg) => {
    console.log(selected);
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const isWithinAllowedTime = (selectInfo: DateSpanApi) => {
    const start = selectInfo.start;
    const end = selectInfo.end;
    const dayOfWeek = start.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const startHour = start.getHours();
    const endHour = end.getHours();

    const allowedWeekdayTimes = [
      [8, 9],
      [12, 13],
      [18, 19],
      [19, 20],
      [20, 21],
    ];

    const allowedWeekendTimes = [
      [8, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [12, 13],
      [13, 14],
      [14, 15],
      [15, 16],
      [16, 17],
      [17, 18],
      [18, 19],
      [19, 20],
      [20, 21],
    ];

    if (modeData && modeData.mode.mode === "通常") {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // 평일 (월~금)
        return allowedWeekdayTimes.some(
          ([s, e]) => startHour >= s && endHour <= e
        );
      } else {
        // 주말 (토, 일)
        return allowedWeekendTimes.some(
          ([s, e]) => startHour >= s && endHour <= e
        );
      }
    } else if (modeData && modeData.mode.mode === "休み") {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // 평일 (월~금)
        return allowedWeekendTimes.some(
          ([s, e]) => startHour >= s && endHour <= e
        );
      } else {
        // 주말 (토, 일)
        return allowedWeekendTimes.some(
          ([s, e]) => startHour >= s && endHour <= e
        );
      }
    } else return false;
  };

  const handleAddReservation = async () => {
    if (bandName === "" || password === "") {
      alert("バンド名とパスワードは必須項目です。");
      return;
    }

    setIsSaveLoading(true);

    const newEvent = {
      id: `${bandName}_${password}_${selectedDate?.start.getTime()}`,
      bandName: bandName,
      start: selectedDate?.start,
      end: selectedDate?.end,
      allDay: selectedDate?.allDay,
      password: password,
    };

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(newEvent),
    });

    const data = await response.json();

    console.log({ data });

    if (data.success) {
      alert("予約が正常に完了しました。");
    } else if (!data.success) {
      alert(data.message);
    }

    await mutate();

    setCalendarKey((prevKey) => prevKey + 1);

    setIsSaveLoading(false);

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    mutate();
    setIsDialogOpen(false);
    setBandName("");
    setPassword("");
  };

  const handleEventClick = async (selected: EventClickArg) => {
    const reservationId = selected.event.id;

    const password = window.prompt(
      "予約の際に設定したPasswordを入力してください。"
    );
    if (password && window.confirm(`この予約を削除してもよろしいですか?`)) {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(password),
      });

      const data = await response.json();

      if (!data.success) {
        alert("予約Passwordが一致しません。");
      }

      if (data.success) {
        alert(data.message);

        await mutate();

        // key를 변경하여 캘린더 강제 리렌더링
        setCalendarKey((prevKey) => prevKey + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="text-xs md:text-base p-8">
      <p className="font-semibold mb-2">カシノキ＿バンド練＿予約</p>
      <FullCalendar
        initialView="customWeek"
        views={{
          customWeek: {
            type: "timeGrid",
            duration: { days: 5 }, // 7일 단위 뷰 생성
          },
        }}
        validRange={{
          start: new Date(),
        }}
        allDaySlot={false}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locale={"ja"}
        slotDuration="01:00:00"
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        height={"auto"}
        selectable={true}
        select={handleDateClick}
        selectMirror={true}
        editable={false}
        selectAllow={isWithinAllowedTime}
        key={calendarKey}
        events={events}
        displayEventTime={false}
        eventClick={handleEventClick}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>練習の予約</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                バンド名
              </Label>
              <Input
                className="col-span-3"
                value={bandName}
                onChange={(e) => {
                  setBandName(e.target.value);
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                パスワード
              </Label>
              <Input
                className="col-span-3"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isSaveLoading} onClick={handleAddReservation}>
              {isSaveLoading ? (
                <div className="flex flex-row">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                "予約"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
