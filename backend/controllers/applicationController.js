const db = require('../config/db');

exports.applyForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        
        // Check if job exists
        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (jobs.length === 0) return res.status(404).json({ message: 'Job not found' });

        // Check if already applied
        const [existing] = await db.query('SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?', [jobId, req.userId]);
        if (existing.length > 0) return res.status(400).json({ message: 'You have already applied for this job' });

        await db.query('INSERT INTO applications (job_id, seeker_id) VALUES (?, ?)', [jobId, req.userId]);
        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSeekerApplications = async (req, res) => {
    try {
        const query = `
            SELECT applications.*, jobs.title, jobs.location, users.name as company_name 
            FROM applications 
            JOIN jobs ON applications.job_id = jobs.id 
            JOIN users ON jobs.hr_id = users.id 
            WHERE applications.seeker_id = ?
            ORDER BY applications.applied_at DESC
        `;
        const [applications] = await db.query(query, [req.userId]);
        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// HR specific
exports.getJobApplicants = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        // Verify job belongs to HR
        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ? AND hr_id = ?', [jobId, req.userId]);
        if (jobs.length === 0) return res.status(403).json({ message: 'Unauthorized or job not found' });

        const query = `
            SELECT applications.id as application_id, applications.status, applications.applied_at, 
                   users.id as user_id, users.name, users.email, 
                   profiles.skills, profiles.resume_url, profiles.education, profiles.experience
            FROM applications 
            JOIN users ON applications.seeker_id = users.id 
            LEFT JOIN profiles ON users.id = profiles.user_id
            WHERE applications.job_id = ?
            ORDER BY applications.applied_at DESC
        `;
        const [applicants] = await db.query(query, [jobId]);
        res.json(applicants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;

        if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Verify that this application is for a job owned by the HR
        const [applications] = await db.query(`
            SELECT applications.*, jobs.hr_id 
            FROM applications 
            JOIN jobs ON applications.job_id = jobs.id 
            WHERE applications.id = ?
        `, [applicationId]);

        if (applications.length === 0) return res.status(404).json({ message: 'Application not found' });
        if (applications[0].hr_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

        await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId]);
        
        // TODO: Send Email Notification to applicant
        
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
