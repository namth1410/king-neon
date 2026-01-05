"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Compass, MapPin, Globe, Award, Users, PenTool } from "lucide-react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import styles from "./about.module.scss";

const stats = [
  { label: "Daily Production", value: "29 Signs" },
  { label: "Total Since 2019", value: "10K+" },
  { label: "Annual Capacity", value: "30K+" },
  { label: "Global Team", value: "700+" },
];

const locations = [
  {
    city: "Central Coast",
    role: "Global Headquarters",
    icon: Globe,
    lat: -33.4269,
    lng: 151.3418,
  },
  {
    city: "Las Vegas",
    role: "Sales & Support",
    icon: MapPin,
    lat: 36.1699,
    lng: -115.1398,
  },
  {
    city: "Dallas",
    role: "Manufacturing",
    icon: PenTool,
    lat: 32.7767,
    lng: -96.797,
  },
  {
    city: "London",
    role: "Sales & Support",
    icon: Compass,
    lat: 51.5074,
    lng: -0.1278,
  },
  { city: "UAE", role: "Sales Hub", icon: Award, lat: 25.2048, lng: 55.2708 },
  {
    city: "Shenzhen",
    role: "International Mfg",
    icon: Users,
    lat: 22.5431,
    lng: 114.0579,
  },
];

export default function AboutClient() {
  return (
    <main className={styles.about}>
      {/* Hero Section */}
      <section className={styles.about__hero}>
        <motion.div
          className={styles["about__hero-content"]}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles["about__hero-title"]}>ABOUT US</h1>
          <p className={styles["about__hero-subtitle"]}>
            Learn a little bit about who we are and what we are about. Creating
            amazing neon signs and even better relationships throughout the
            world.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className={styles.about__stats}>
        <div className={styles["about__stats-grid"]}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className={styles["about__stats-item"]}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles["about__stats-item-value"]}>
                {stat.value}
              </div>
              <div className={styles["about__stats-item-label"]}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journey Section */}
      <section className={styles.about__journey}>
        <div className={styles["about__journey-container"]}>
          <motion.div
            className={styles["about__journey-content"]}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Our Journey</h2>
            <p>
              Kings of Neon started mid 2019 with founder Stephen Pastor&apos;s
              dream to inspire and create amazing neon signs and even better
              relationships throughout the world.
            </p>
            <p>
              Fast forward to today and we are a core team of creative hustlers
              bringing personal and business sign dreams to life. As Kings of
              Neon continues to grow, so does the desire to always bring the
              best old school customer service mixed with the most up to date,
              modern and advanced products and technology to market.
            </p>
            <p>
              Our head office is located in Australia with our team members and
              manufacturing partners spread across the globe with offices in the
              USA and also New Zealand.
            </p>
          </motion.div>

          <motion.div
            className={styles["about__journey-image"]}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Using a high-quality neon workshop/office styled image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
              alt="Kings of Neon Workshop"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Locations Section */}
      <section className={styles.about__locations}>
        <div className={styles["about__locations-header"]}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Offices Around the Globe
          </motion.h2>
          <p>Global presence for local support</p>
        </div>

        {/* Interactive Map */}
        <motion.div
          className={styles["about__map"]}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles["about__map-wrapper"]}>
            <Map center={[30, 20]} zoom={1.5}>
              <MapControls showZoom showFullscreen />
              {locations.map((loc, index) => (
                <MapMarker key={index} longitude={loc.lng} latitude={loc.lat}>
                  <MarkerContent>
                    <div className={styles["about__map-marker"]}>
                      <loc.icon size={16} />
                    </div>
                  </MarkerContent>
                  <MarkerPopup>
                    <div className={styles["about__map-popup"]}>
                      <h4>{loc.city}</h4>
                      <p>{loc.role}</p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              ))}
            </Map>
          </div>
        </motion.div>

        <div className={styles["about__locations-grid"]}>
          {locations.map((loc, index) => (
            <motion.div
              key={index}
              className={styles["about__locations-card"]}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles["about__locations-card-icon"]}>
                <loc.icon size={24} />
              </div>
              <h3 className={styles["about__locations-city"]}>{loc.city}</h3>
              <p className={styles["about__locations-desc"]}>{loc.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.about__cta}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>
            Ready to light up
            <br />
            your world?
          </h2>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/create" className={styles["about__cta-button"]}>
              Create Your Neon
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
