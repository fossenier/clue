"use client";
import { useRouter } from "next/navigation";
import React from "react";

import { BOARD } from "@constants/index";

export default function Test() {
  const router = useRouter();

  const send = async () => {
    router.push("/login");
  };

  return <div className="w-20 h-20 bg-turquoise" onClick={send}></div>;
}
