import React, { useEffect, useState } from "react";
import axios from "axios";

const JobList = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/jobs")
      .then((response) => setJobs(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>Job Listings</h1>
      {jobs.map((job) => (
        <div key={job._id}>
          <h2>{job.title}</h2>
          <p>{job.description}</p>
          <p>{job.location}</p>
          <p>${job.salary}</p>
        </div>
      ))}
    </div>
  );
};

export default JobList;