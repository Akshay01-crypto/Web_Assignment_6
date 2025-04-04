/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Akshay Nedumparambil Unnikrishnan Student ID: 190635235 Date: April 4, 2025
*  Online (Vercel) Link: [Add your Vercel link here after deployment]
*
*********************************************************************************/

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const collegeData = require("./collegeData.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

const excludedCourseCodes = ["DBD800", "DBW825", "SEC835", "WTP100"];

app.get("/", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            const filteredCourses = courses.filter(course => !excludedCourseCodes.includes(course.courseCode));
            res.render("layouts/main", { body: "home", courses: filteredCourses, activeRoute: "/" });
        })
        .catch(() => {
            res.render("layouts/main", { body: "home", courses: [], activeRoute: "/" });
        });
});

app.get("/about", (req, res) => {
    res.render("layouts/main", { body: "about", activeRoute: "/about" });
});

app.get("/htmlDemo", (req, res) => {
    res.render("layouts/main", { body: "htmlDemo", activeRoute: "/htmlDemo" });
});


app.get("/students", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            const filteredCourses = courses.filter(course => !excludedCourseCodes.includes(course.courseCode));
            if (req.query.course) {
                collegeData.getStudentsByCourse(req.query.course)
                    .then((students) => {
                        res.render("layouts/main", {
                            body: "students",
                            students: students.length > 0 ? students : [],
                            courses: filteredCourses,
                            selectedCourse: req.query.course,
                            message: students.length === 0 ? "no results" : null,
                            activeRoute: "/students"
                        });
                    })
                    .catch((err) => {
                        res.render("layouts/main", {
                            body: "students",
                            message: err,
                            courses: filteredCourses,
                            selectedCourse: req.query.course,
                            activeRoute: "/students"
                        });
                    });
            } else {
                collegeData.getAllStudents()
                    .then((students) => {
                        res.render("layouts/main", {
                            body: "students",
                            students: students.length > 0 ? students : [],
                            courses: filteredCourses,
                            selectedCourse: null,
                            message: students.length === 0 ? "no results" : null,
                            activeRoute: "/students"
                        });
                    })
                    .catch((err) => {
                        res.render("layouts/main", {
                            body: "students",
                            message: err,
                            courses: filteredCourses,
                            selectedCourse: null,
                            activeRoute: "/students"
                        });
                    });
            }
        })
        .catch(() => {
            res.render("layouts/main", {
                body: "students",
                message: "Unable to load courses",
                courses: [],
                selectedCourse: null,
                activeRoute: "/students"
            });
        });
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};
    collegeData.getStudentByNum(req.params.studentNum)
        .then((student) => {
            if (student) viewData.student = student;
            else viewData.student = null;
        })
        .catch(() => {
            viewData.student = null;
        })
        .then(collegeData.getCourses)
        .then((courses) => {
            viewData.courses = courses;
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        })
        .catch(() => {
            viewData.courses = [];
        })
        .then(() => {
            if (viewData.student == null) {
                res.status(404).send("Student Not Found");
            } else {
                res.render("layouts/main", { body: "student", viewData: viewData, activeRoute: "/student" });
            }
        });
});

app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            const filteredCourses = courses.filter(course => !excludedCourseCodes.includes(course.courseCode));
            if (filteredCourses.length > 0) {
                res.render("layouts/main", { body: "courses", courses: filteredCourses, activeRoute: "/courses" });
            } else {
                res.render("layouts/main", { body: "courses", message: "no results", activeRoute: "/courses" });
            }
        })
        .catch((err) => {
            res.render("layouts/main", { body: "courses", message: err, activeRoute: "/courses" });
        });
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((course) => {
            if (!course) res.status(404).send("Course Not Found");
            else res.render("layouts/main", { body: "course", course: course, activeRoute: "/course" });
        })
        .catch(() => res.status(404).send("Course Not Found"));
});

app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            res.render("layouts/main", { body: "addStudent", courses: courses, activeRoute: "/students/add" });
        })
        .catch(() => {
            res.render("layouts/main", { body: "addStudent", courses: [], activeRoute: "/students/add" });
        });
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch((err) => res.status(500).json({ error: err }));
});
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch((err) => res.status(500).json({ error: err }));
});
app.get("/courses/add", (req, res) => {
    res.render("layouts/main", { body: "addCourse", activeRoute: "/courses/add" });
});

app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => res.redirect("/courses"))
        .catch((err) => res.render("layouts/main", { body: "addCourse", message: err, activeRoute: "/courses/add" }));
});

app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => res.redirect("/courses"))
        .catch((err) => res.status(500).json({ error: err }));
});

app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => res.redirect("/courses"))
        .catch(() => res.status(500).send("Unable to Remove Course / Course not found"));
});

app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => res.redirect("/students"))
        .catch(() => res.status(500).send("Unable to Remove Student / Student not found"));
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "views/404.html"));
});

collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => console.log(`Server running on port ${HTTP_PORT}`));
    })
    .catch((err) => {
        console.error(err);
    });