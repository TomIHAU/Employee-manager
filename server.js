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
// const findRoles = () => {
//   db.query(`SELECT role.id, role.title FROM role`, (err, res) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     return res;
//   });
// };
// const findManagers = () => {
//   db.query(
//     `SELECT employee.id, employee.first_name,
//     employee.last_name FROM employee`,
//     (err, res) => {
//       if (err) {
//         res.status(400).json({ error: err.message });
//         return;
//       }
//       return res;
//     }
//   );
// };
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
        name: "firstName",
        type: "input",
        message: "What is the Employees' first name?",
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the Employees' last name?",
      },
      {
        type: "list",
        name: "role",
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
        name: "manager",
        message: "Who is the Employees' manager?",
        choices: newManager,
      },
    ]);

    console.log(newEmployee);
  } catch (err) {
    console.log(err);
  }
  //   .then((newEmployee) => console.log(newEmployee))
  //   .catch((err) => {
  //     console.log(err);
  //   });    .push[{ name: "No manager", value: null }]

  // const managers = db.query(
  //  `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id FROM employee`
  // );
  // console.log(managers);

  // console.log(err);

  // let newEmployee = await inquirer.prompt(
  //   {
  //     type: "input",
  //     name: "firstName",
  //     message: "What is the Employees' first name?",
  //   },
  //   {
  //     type: "input",
  //     name: "lastName",
  //     message: "What is the Employees' last name?",
  //   },
  //   {
  //     type: "input",
  //     name: "firstName",
  //     message: "What is the Employees' first name?",
  //   }
  //   { employee role
  //     type:"input",
  //     name:"firstName",
  //     message:"What is the Employees' first name?"
  //   },
  //   {manager id
  //     type:"input",
  //     name:"firstName",
  //     message:"What is the Employees' first name?"
  //   },
  // );
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
