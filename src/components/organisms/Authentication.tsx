"use client";
import { handleUserLogin, logout } from "@/actions/auth";

import { useEffect, useEffectEvent } from "react";

type AuthenticationPropsType = { isLogin: true; rotation: boolean; id: string } | { isLogin: false };

const Authentication = (props: AuthenticationPropsType) => {
  const refresh = useEffectEvent(async () => {
    if (!props.isLogin) return await logout();

    if (props.rotation) await handleUserLogin(props.id);
  });

  useEffect(() => {
    refresh();
  }, []);

  return null;
};

export default Authentication;
