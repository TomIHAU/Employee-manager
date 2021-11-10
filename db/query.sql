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

-- INSERT INTO employee SET ?
-- INSERT INTO department SET ?