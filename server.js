const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "rootroot",
    database: "employeetracker_db",
  },
  console.log(`Connected to the employeetracker_db database.`)
);

const showDepartments = () => {
  const sql = `SELECT * FROM department;`;
  db.query(sql, (err, res) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.table(res);
    mainMenu();
  });
};

const showRoles = () => {
  const sql = `SELECT role.id, role.title, role.salary, department.name AS department
      FROM role
      JOIN department
      ON role.department_id = department.id;`;
  db.query(sql, (err, res) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.table(res);
    mainMenu();
  });
};
const showEmployees = () => {
  const sql = `SELECT employee.id, employee.first_name, employee.last_name,
                role.title AS title, department.name AS department, 
                role.salary AS salary, CONCAT(m.first_name, ' ', m.last_name) 
                AS manager
              FROM employee
              LEFT JOIN employee m 
              ON m.id = employee.manager_id
              JOIN role
              ON employee.role_id = role.id
              JOIN department
              ON role.department_id = department.id
              ;`;
  db.query(sql, (err, res) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.table(res);
    mainMenu();
  });
};

const mainMenu = () => {
  inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      name: "choices",
      choices: [
        {
          name: "View all Departments",
          value: "showDepartments",
        },
        {
          name: "View all Roles",
          value: "showRoles",
        },
        {
          name: "View all Employees",
          value: "showEmployees",
        },
        {
          name: "Add Employee",
          value: "addEmployee",
        },
        {
          name: "Add Department",
          value: "addDept",
        },
        {
          name: "Add Role",
          value: "addRole",
        },
        {
          name: "Update Role",
          value: "updateRole",
        },
        {
          name: "Quit",
          value: "quit",
        },
      ],
    })
    .then((answer) => {
      switch (answer.choices) {
        case "showDepartments":
          showDepartments();
          break;
        case "showRoles":
          showRoles();
          break;
        case "showEmployees":
          showEmployees();
          break;
      }
    });
};
mainMenu();
