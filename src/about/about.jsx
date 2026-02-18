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
                src="https://www.google.com/maps?q=40.2518435,-111.6493156&z=16&output=embed"
                title="Kai Tuning Map"
                style={{ border: 0, width: "100%", height: "300px" }}
            ></iframe>

            <p className="muted" style={{ marginTop: '0.75rem' }}>
                <a
                href="https://maps.app.goo.gl/rak3TdeSci1CS52a8?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                >Open in Google Maps</a>
            </p>
            </div>
        </section>
        </main>
  );
}