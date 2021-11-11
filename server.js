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
    console.log("New Employee successfully added");
    mainMenu();
  });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: "name",
        message: "What is the new departments name?",
        type: "input",
      },
    ])
    .then((newDepartment) => {
      const sql = `INSERT INTO department SET ?`;

      db.query(sql, newDepartment, (err, res) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        console.log("New department successfully added");
        mainMenu();
      });
    });
};

const addRole = async () => {
  try {
    const department = await db.promise().query(`SELECT * FROM department`);
    console.log(department[0]);
    let newRole = await inquirer.prompt([
      {
        name: "title",
        type: "input",
        message: "What is the Role?",
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary?",
      },
      {
        type: "list",
        name: "department_id",
        message: "What is the department is it apart of?",
        choices: department[0].map((department) => {
          return {
            name: department.name,
            value: department.id,
          };
        }),
      },
    ]);
    insertRole(newRole);
  } catch (err) {
    console.log(err);
  }
};

const insertRole = (newRole) => {
  const sql = `INSERT INTO role SET ?`;
  db.query(sql, newRole, (err, res) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.log("New Role successfully added");
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
        case "addDepartment":
          addDepartment();
          break;
        case "addRole":
          addRole();
          break;
        case "quit":
          console.log("Thanks for using my employee database manager");
          db.end();
          break;
      }
    });
};

mainMenu();
