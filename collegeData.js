const Sequelize = require('sequelize');

// Connect to Neon.tech database
const sequelize = new Sequelize('Akshay_6', 'Akshay_6_owner', 'npg_1UMDjGQCK7AH', {
    host: 'ep-rough-block-a5auu0vx-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    course: Sequelize.INTEGER
});

// Define Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Relationship
Student.belongsTo(Course, { foreignKey: 'course' });

// ✨ Initialize with Course Seeding
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(async () => {
                const count = await Course.count();
                if (count === 0) {
                    await Course.bulkCreate([
                        { courseCode: 'WEB700', courseDescription: 'Web Programming with Node.js' },
                        { courseCode: 'DBS311', courseDescription: 'Introduction to Databases' },
                        { courseCode: 'OSD600', courseDescription: 'Open Source Development' },
                        { courseCode: 'APD601', courseDescription: 'Advanced Web Development' }
                    ]);
                    console.log("✅ Default courses seeded.");
                }
                resolve();
            })
            .catch(() => reject("unable to sync the database"));
    });
};

// CRUD Operations
module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(data => data.length > 0 ? resolve(data) : reject("no results returned"))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { course: course } })
            .then(data => data.length > 0 ? resolve(data) : reject("no results returned"))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(data => data.length > 0 ? resolve(data) : reject("no results returned"))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { studentNum: num } })
            .then(data => data.length > 0 ? resolve(data[0]) : reject("no results returned"))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findAll({ where: { courseId: id } })
            .then(data => data.length > 0 ? resolve(data[0]) : reject("no results returned"))
            .catch(() => reject("no results returned"));
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        for (let prop in studentData) {
            if (studentData[prop] === "") studentData[prop] = null;
        }
        Student.create(studentData)
            .then(() => resolve())
            .catch(() => reject("unable to create student"));
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        for (let prop in studentData) {
            if (studentData[prop] === "") studentData[prop] = null;
        }
        Student.update(studentData, { where: { studentNum: studentData.studentNum } })
            .then(() => resolve())
            .catch(() => reject("unable to update student"));
    });
};

module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (let prop in courseData) {
            if (courseData[prop] === "") courseData[prop] = null;
        }
        Course.create(courseData)
            .then(() => resolve())
            .catch(() => reject("unable to create course"));
    });
};

module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (let prop in courseData) {
            if (courseData[prop] === "") courseData[prop] = null;
        }
        Course.update(courseData, { where: { courseId: courseData.courseId } })
            .then(() => resolve())
            .catch(() => reject("unable to update course"));
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.destroy({ where: { courseId: id } })
            .then(() => resolve())
            .catch(() => reject("unable to delete course"));
    });
};

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({ where: { studentNum: studentNum } })
            .then(() => resolve())
            .catch(() => reject("unable to delete student"));
    });
};
