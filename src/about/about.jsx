import React from 'react';

export function About() {
  return (
    <main>
        <h1>Shop Info</h1>
        <p>Learn more about Kai Tuning and our services.</p>
        <h2>Our Mission</h2>
        <p>At Kai Tuning, our mission is to provide top-notch tuning services that
        enhance the performance and efficiency of your vehicle.</p>
        <section className="grid">
            <div className="card" aria-labelledby="contactTitle">
                <h2 id="contactTitle">Contact</h2>
                <div className="kv">
                    <div><strong>Email:</strong></div>
                    <div><a href="mailto:contact@kaituning.com">contact@kaituning.com</a></div>
                    <div><strong>Phone:</strong></div>
                    <div><a href="tel:+11234567890">(123) 456-7890</a></div>
                    <div><strong>Address:</strong></div>
                    <div>123 Tuning St., Auto City, UT 84604</div>
                    <div><strong>Hours</strong></div>
                    <div>
                    Mon-Fri: 9:00 AM - 5:00 PM<br />
                    Sat: By Appointments<br />
                    Sun: Closed
                    </div>
                </div>
            </div>
            <div className="card" aria-labelledby="mapTitle">
            <h2 id="mapTitle">Map</h2>
            <iframe
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!3m1!4b1!4m6!3m5!1s0x874d90bc4aa0b68d:0xbf3eb3a3f30fdc4c!8m2!3d40.2518435!4d-111.6493156!16zL20vMGwydGs?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D"
                title="Kai Tuning Map"
            ></iframe>

            <p className="muted" style={{ marginTop: '0.75rem' }}>
                <a
                href="https://www.google.com/maps/place/ブリガムヤング大学/@40.2518435,-111.6518905,17z/data=!3m1!4b1!4m6!3m5!1s0x874d90bc4aa0b68d:0xbf3eb3a3f30fdc4c!8m2!3d40.2518435!4d-111.6493156!16zL20vMGwydGs?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D"
                target="_blank"
                rel="noopener noreferrer"
                >Open Google Maps</a>
            </p>
            </div>
        </section>
        </main>
  );
}