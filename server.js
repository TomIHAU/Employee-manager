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

const addEmployee = async () => {
  try {
    const roles = await db
      .promise()
      .query(`SELECT role.id, role.title FROM role`);
    const managers = await db.promise().query(
      `SELECT employee.id, employee.first_name,
      employee.last_name FROM employee`
    );
    let newManager = managers[0].map((manager) => {
      return {
        name: manager.first_name + " " + manager.last_name,
        value: manager.id,
      };
    });
    newManager.push({ name: "No Manager", value: null });

    let newEmployee = await inquirer.prompt([
      {
        name: "first_name",
        type: "input",
        message: "What is the Employees' first name?",
      },
      {
        name: "last_name",
        type: "input",
        message: "What is the Employees' last name?",
      },
      {
        type: "list",
        name: "role_id",
        message: "What is the Employees' role?",
        choices: roles[0].map((role) => {
          return {
            name: role.title,
            value: role.id,
          };
        }),
      },

      {
        type: "list",
        name: "manager_id",
        message: "Who is the Employees' manager?",
        choices: newManager,
      },
    ]);
    insertEmployee(newEmployee);
  } catch (err) {
    console.log(err);
  }
};

const insertEmployee = (newEmployee) => {
  const sql = `INSERT INTO employee SET ?`;
  db.query(sql, newEmployee, (err, res) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.log("Employee successfully added");
    mainMenu();
  });
};

const addDepartment = () => {};

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
          value: "addDepartment",
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
        case "addEmployee":
          addEmployee();
          break;
        case "quit":
          console.log("Thanks for using my employee database manager");
          db.end();
          break;
      }
    });
};

mainMenu();
