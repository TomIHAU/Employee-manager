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
    console.table("Departments", res);
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
    console.table("Roles", res);
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
              LEFT JOIN role
              ON employee.role_id = role.id
              LEFT JOIN department
              ON role.department_id = department.id
              ;`;
  db.query(sql, (err, res) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.table("Employees", res);
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

const updateRole = async () => {
  try {
    const roles = await db
      .promise()
      .query(`SELECT role.id, role.title FROM role`);
    const employees = await db.promise().query(
      `SELECT employee.id, employee.first_name,
      employee.last_name FROM employee`
    );
    const updatedEmployeeRole = await inquirer.prompt([
      {
        type: "list",
        name: "id",
        message: "Which employees' role do you wish to update?",
        choices: employees[0].map((employee) => {
          return {
            name: employee.first_name + " " + employee.last_name,
            value: employee.id,
          };
        }),
      },
      {
        type: "list",
        name: "role_id",
        message: "What new role does the employee have?",
        choices: roles[0].map((role) => {
          return {
            name: role.title,
            value: role.id,
          };
        }),
      },
    ]);
    insertUpdatedRole(updatedEmployeeRole);
  } catch (err) {
    console.log(err);
  }
};

const insertUpdatedRole = (updatedEmployeeRole) => {
  const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
  db.query(
    sql,
    [updatedEmployeeRole.role_id, updatedEmployeeRole.id],
    (err, res) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      console.log("Employees role successfully Changed");
      mainMenu();
    }
  );
};

const updateManager = async () => {
  try {
    const employees = await db.promise().query(`SELECT * FROM employee`);
    const updatedEmployeeManager = await inquirer.prompt([
      {
        type: "list",
        name: "id",
        message: "Which employees' Manager do you wish to update?",
        choices: employees[0].map((employee) => {
          return {
            name: employee.first_name + " " + employee.last_name,
            value: employee.id,
          };
        }),
      },
      {
        type: "list",
        name: "manager_id",
        message: "What new manager does the employee have?",
        choices: employees[0].map((manager) => {
          return {
            name: manager.first_name + " " + manager.last_name,
            value: manager.id,
          };
        }),
      },
    ]);
    insertUpdatedManager(updatedEmployeeManager);
  } catch (err) {
    console.log(err);
  }
};

const insertUpdatedManager = (updatedEmployeeManager) => {
  const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
  db.query(
    sql,
    [updatedEmployeeManager.manager_id, updatedEmployeeManager.id],
    (err, res) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      console.log("Employees manager successfully Changed");
      mainMenu();
    }
  );
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
          name: "Update Employees Role",
          value: "updateRole",
        },
        {
          name: "Update Employees Manager",
          value: "updateManager",
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
        case "updateRole":
          updateRole();
          break;
        case "updateManager":
          updateManager();
          break;
        case "quit":
          console.log("Thanks for using my employee database manager");
          db.end();
          break;
      }
    });
};

mainMenu();
