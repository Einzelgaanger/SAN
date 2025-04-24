
import { useState, useEffect } from "react";

export type UserInfo = {
  id?: string;
  name: string;
  region?: string;
  region_id?: string;
  phone?: string;
};

export function useUserInfo() {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    console.log("UserInfo hook, current user:", user);
  }, [user]);

  const updateUser = (userInfo: UserInfo | null) => {
    console.log("Updating user info:", userInfo);
    setUser(userInfo);
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("userInfo");
    }
  };

  return { user, updateUser };
}
