const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const [profiles] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.userId]);
        const profile = profiles.length > 0 ? profiles[0] : {};
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { skills, education, experience, company_name } = req.body;
        
        const [existing] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.userId]);
        
        if (existing.length === 0) {
            await db.query(`
                INSERT INTO profiles (user_id, skills, education, experience, company_name) 
                VALUES (?, ?, ?, ?, ?)`, 
                [req.userId, skills, education, experience, company_name]
            );
        } else {
            await db.query(`
                UPDATE profiles 
                SET skills = ?, education = ?, experience = ?, company_name = ? 
                WHERE user_id = ?`, 
                [skills, education, experience, company_name, req.userId]
            );
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Return URL path based on static file serving
        const resumeUrl = `/uploads/${req.file.filename}`;
        
        await db.query('UPDATE profiles SET resume_url = ? WHERE user_id = ?', [resumeUrl, req.userId]);
        res.json({ message: 'Resume uploaded successfully', resumeUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Saved Jobs feature
exports.saveJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        await db.query('INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [req.userId, jobId]);
        res.json({ message: 'Job saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSavedJobs = async (req, res) => {
    try {
        const query = `
            SELECT jobs.*, users.name as company_name 
            FROM jobs 
            JOIN saved_jobs ON jobs.id = saved_jobs.job_id 
            JOIN users ON jobs.hr_id = users.id 
            WHERE saved_jobs.user_id = ?
        `;
        const [jobs] = await db.query(query, [req.userId]);
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        if (req.userRole === 'seeker') {
            const [[{ appliedCount }]] = await db.query('SELECT COUNT(*) as appliedCount FROM applications WHERE seeker_id = ?', [req.userId]);
            const [[{ savedCount }]] = await db.query('SELECT COUNT(*) as savedCount FROM saved_jobs WHERE user_id = ?', [req.userId]);
            res.json({ appliedCount, savedCount });
        } else if (req.userRole === 'hr') {
            const [[{ jobsCount }]] = await db.query('SELECT COUNT(*) as jobsCount FROM jobs WHERE hr_id = ?', [req.userId]);
            const [[{ applicantsCount }]] = await db.query(`
                SELECT COUNT(*) as applicantsCount 
                FROM applications 
                JOIN jobs ON applications.job_id = jobs.id 
                WHERE jobs.hr_id = ?`, 
                [req.userId]
            );
            res.json({ jobsCount, applicantsCount });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
