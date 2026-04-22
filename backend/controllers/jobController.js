const db = require('../config/db');

// List jobs (Public or Seeker) - with advanced search
exports.getAllJobs = async (req, res) => {
    try {
        const { search, location, category, minSalary } = req.query;
        let query = 'SELECT jobs.*, users.name as company_name FROM jobs JOIN users ON jobs.hr_id = users.id WHERE 1=1';
        const queryParams = [];

        if (search) {
            query += ' AND (jobs.title LIKE ? OR jobs.description LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }
        if (location) {
            query += ' AND jobs.location LIKE ?';
            queryParams.push(`%${location}%`);
        }
        if (category) {
            query += ' AND jobs.category = ?';
            queryParams.push(category);
        }
        if (minSalary) {
             query += ' AND CAST(jobs.salary AS UNSIGNED) >= ?';
             queryParams.push(parseInt(minSalary));
        }

        query += ' ORDER BY jobs.created_at DESC';

        const [jobs] = await db.query(query, queryParams);
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getJobDetails = async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT jobs.*, users.name as company_name FROM jobs JOIN users ON jobs.hr_id = users.id WHERE jobs.id = ?', [req.params.id]);
        if (jobs.length === 0) return res.status(404).json({ message: 'Job not found' });
        res.json(jobs[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// HR specific routes
exports.postJob = async (req, res) => {
    try {
        const { title, description, category, location, salary, deadline } = req.body;
        
        let formattedDeadline = deadline;
        if (!deadline || deadline === '') {
            formattedDeadline = null;
        }

        const [result] = await db.query(
            'INSERT INTO jobs (hr_id, title, description, category, location, salary, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.userId, title, description, category, location, salary, formattedDeadline]
        );
        res.status(201).json({ message: 'Job posted successfully', jobId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const { title, description, category, location, salary, deadline } = req.body;
        // Verify job belongs to HR
        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ? AND hr_id = ?', [req.params.id, req.userId]);
        if (jobs.length === 0) return res.status(403).json({ message: 'Not authorized to modify this job or job not found' });

        await db.query(
            'UPDATE jobs SET title = ?, description = ?, category = ?, location = ?, salary = ?, deadline = ? WHERE id = ?',
            [title, description, category, location, salary, deadline, req.params.id]
        );
        res.json({ message: 'Job updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ? AND hr_id = ?', [req.params.id, req.userId]);
        if (jobs.length === 0) return res.status(403).json({ message: 'Not authorized to modify this job or job not found' });

        await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getHrJobs = async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT * FROM jobs WHERE hr_id = ? ORDER BY created_at DESC', [req.userId]);
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
