-- SELECT *
-- FROM department;

-- SELECT role.id, role.title, role.salary, department.name AS department
-- FROM role
-- JOIN department
-- ON role.department_id = department.id;

SELECT employee.id, employee.first_name, employee.last_name,
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

;

--  (SELECT
--     employee.first_name + ' ' + employee.last_name AS employee,
--     employee.first_name + ' ' + employee.last_name AS manager
--     FROM
--     employee
--     INNER JOIN employee ON employee.id = employee.manager_id);

-- SELECT employee.id, employee.first_name, employee.last_name, 
-- role.title, department.name AS department, role.salary,
--  CONCAT(manager.first_name, ' ', manager.last_name) 
--  AS manager 
--  FROM employee 
--  LEFT JOIN role on employee.role_id = role.id 
--  LEFT JOIN department on role.department_id = department.id 
--  LEFT JOIN employee manager on manager.id = employee.manager_id;