// app/components/Gallery.jsx
"use client"
import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import styles from "./Gallery.module.css"

export default function Gallery() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [images, setImages] = useState([]) // array of image URLs

  // Update viewport size for confetti
  useEffect(() => {
    const update = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // Load image filenames from the public/original_images folder via API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/images');
        if (!res.ok) throw new Error('Failed to fetch images');
        const data = await res.json();
        // data is an array of URLs like '/original_images/filename.jpg'
        setImages(data);
      } catch (error) {
        console.error('Error loading images:', error);
        setImages([]);
      }
    };
    fetchImages();
  }, []);


  return (
    <section className={styles.container}>
      <Confetti width={dimensions.width} height={dimensions.height} />
      <h2 className={styles.title}>Congratulations! 🎉</h2>
      <p className={styles.subtitle}>Happy 70th Birthday! Enjoy the memories below.</p>
      <div className={styles.grid}>
         {images.length > 0
           ? images.map((src, i) => (
               <img key={i} src={src} alt={`memory-${i}`} className={styles.image} />
             ))
           : Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className={styles.placeholder} />
             ))}
      </div>
    </section>
  )
}
