import React from "react";

import "./About.css";

const About = () => {
  return (
    <div className="info-page">
      <h2>About ANAMETRIC</h2>
      <p>
        ANAMETRIC is a modern DevOps metrics dashboard inspired by Grafana,
        designed to track and visualize DORA metrics like Deployment Frequency,
        Lead Time, MTTR, and Change Failure Rate.
      </p>
      <p>
        Built with React and Chart.js, it gives engineering teams real-time
        insights into delivery performance, helping them move faster and more
        reliably.
      </p>
    </div>
  );
};

export default About;