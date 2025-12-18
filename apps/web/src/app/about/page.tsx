import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | King Neon",
  description:
    "Learn about King Neon, our journey, and our mission to create amazing neon signs and better relationships throughout the world.",
};

export default function AboutPage() {
  return <AboutClient />;
}
