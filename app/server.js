const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const connection = mysql.createConnection({
    host: '34.68.237.112',
    user: 'root',
    password: 'hardstuck',
    database: 'CrimeData'
})

let app = express();
app.use(cors());

app.get('/', function (req, res) {
    res.send({ 'message': 'Hello' });
});

app.get('/crimes', function (req, res) {
    const { crime_id } = req.query;
    if (crime_id && isNaN(crime_id)) {
        res.json({ 'message': 'Invalid crime_id' })
        return;
    }

    if (!crime_id) {
        connection.query('SELECT * FROM Crime', function (err, rows, fields) {
            if (err) throw err;
            res.json(rows);
        });
        return;
    }

    connection.query(`SELECT * FROM Crime WHERE crimeID=${crime_id}`, function (err, rows, fields) {
        if (err) throw err;
        res.json(rows);
    });
})

app.get("/weapons", function (req, res) {
    const { weapon_desc } = req.query;

    if (!weapon_desc) {
        connection.query('SELECT * FROM Weapon', function (err, rows, fields) {
            if (err) throw err;
            res.send(rows);
        });
        return;
    }

    connection.query(`SELECT * FROM Weapon WHERE weaponDesc LIKE '%${weapon_desc}%'`, function (err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
});

app.post('/weapons', bodyParser.json(), function (req, res) {
    const { weaponUsedCode, weaponDesc } = req.body;

    if (!weaponDesc || !weaponUsedCode || isNaN(weaponUsedCode)) {
        res.json({ 'message': 'Invalid body' })
        return;
    }

    connection.query(`INSERT INTO Weapon VALUES (${weaponUsedCode}, '${weaponDesc}')`, function (err, rows, fields) {
        if (err) {
            res.json({ 'message': 'Error' })
            return;
        }
        res.json(rows);
    });
});

app.put('/weapons', bodyParser.json(), function (req, res) {
    const { weaponUsedCode, weaponDesc } = req.body;

    if (!weaponDesc || !weaponUsedCode || isNaN(weaponUsedCode)) {
        res.json({ 'message': 'Invalid body' })
        return;
    }

    connection.query(`UPDATE Weapon SET weaponDesc='${weaponDesc}' WHERE weaponUsedCode=${weaponUsedCode}`, function (err, rows, fields) {
        if (err) throw err;
        res.json(rows);
    });
});

app.delete('/weapons', function (req, res) {
    const { weapon_used_code } = req.query;

    if (!weapon_used_code || isNaN(weapon_used_code)) {
        res.json({ 'message': 'Invalid weaponUsedCode' })
        return;
    }

    connection.query(`DELETE FROM Weapon WHERE weaponUsedCode=${weapon_used_code}`, function (err, rows, fields) {
        if (err) throw err;
        res.json(rows);
    });
});

app.get('/common-weapons', function (req, res) {
    connection.query(`
        SELECT 
            a.areaCode,
            a.areaName,
            c.crimeID,
            v.age,
            w.weaponUsedCode
        FROM 
            Crime c
        NATURAL JOIN 
            Location l
        NATURAL JOIN 
            Area a
        NATURAL JOIN Weapon w
        NATURAL JOIN Victim v
        WHERE 
            w.weaponUsedCode 
            =
            (
            SELECT 
                        weaponUsedCode
            FROM 
                (
                    SELECT weaponUsedCode, COUNT(weaponUsedCode) AS codeCount
                    FROM Crime
                    GROUP BY weaponUsedCode
                ) e
            WHERE
                codeCount >= ALL(
                    SELECT COUNT(weaponUsedCode)
                    FROM Crime
                    GROUP BY weaponUsedCode)
            )
        AND
            v.age > 30

        ORDER BY 
            a.areaCode ASC
    `, function (err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    }
    )
});

app.get('/crimes-by-date', function (req, res) {
    const { date_occ } = req.query;

    if (!date_occ) {
        res.send({ 'message': 'Invalid date_occ' })
        return;
    }

    connection.query(`
    SELECT
        a.areaCode,
        COUNT(crimeTime.CrimeID) as crimeCount
    FROM
        Area a
        NATURAL JOIN Location l
        NATURAL JOIN (
            SELECT
                LocationID,
                CrimeID
            FROM
                Crime
            WHERE
                dateOcc = '${date_occ}'
        ) crimeTime
    GROUP BY
        a.areaCode
    ORDER BY
        crimeCount DESC
    `, function (err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
});

app.get('/area-info', function (req, res) {
    const { area_code } = req.query;

    if (!area_code || isNaN(area_code)) {
        res.send({ 'message': 'Invalid date_occ' })
        return;
    }

    connection.query(`CALL AREAINFO(${area_code})`, function (err, rows, fields) {
        if (err) throw err;
        res.send(rows[0][0]);
    });
});

app.get('/locations', function (req, res) {
    const { location_id, area_id, start, end } = req.query;
    if (location_id && area_id) {
        res.json({ 'message': 'Invalid query' })
        return;
    }

    if (location_id && isNaN(location_id)) {
        res.json({ 'message': 'Invalid location_id' })
        return;
    }

    if (area_id && isNaN(area_id)) {
        res.json({ 'message': 'Invalid area_id' })
        return;
    }

    if (location_id) {
        connection.query(`SELECT * FROM Location WHERE locationID=${location_id}`, function (err, rows, fields) {
            if (err) throw err;
            res.json(rows);
        });
        return;
    }

    if (area_id && start && end) {
        if (start > end) {
            connection.query(`SELECT * FROM Location WHERE areaCode=${area_id} AND locationID NOT IN (SELECT locationID FROM Crime WHERE timeOcc BETWEEN '${end}' AND '${start}')`, function (err, rows, fields) {
                if (err) throw err;
                res.json(rows);
            });
            return;
        }
        connection.query(`SELECT * FROM Location WHERE areaCode=${area_id} AND locationID IN (SELECT locationID FROM Crime WHERE timeOcc BETWEEN '${start}' AND '${end}')`, function (err, rows, fields) {
            if (err) throw err;
            res.json(rows);
        });
        return;
    }

    if (area_id) {
        connection.query(`SELECT * FROM Location WHERE areaCode=${area_id}`, function (err, rows, fields) {
            if (err) throw err;
            res.json(rows);
        });
        return;
    }

    if (start && end) {
        if (start > end) {
            connection.query(`SELECT * FROM Location WHERE locationID NOT IN (SELECT locationID FROM Crime WHERE timeOcc BETWEEN '${end}' AND '${start}')`, function (err, rows, fields) {
                if (err) throw err;
                res.json(rows);
            });
            return;
        }
        connection.query(`SELECT * FROM Location WHERE locationID IN (SELECT locationID FROM Crime WHERE timeOcc BETWEEN '${start}' AND '${end}')`, function (err, rows, fields) {
            if (err) throw err;
            res.json(rows);
        });
        return;
    }

    connection.query('SELECT * FROM Location', function (err, rows, fields) {
        if (err) throw err;
        res.json(rows);
    });
    return;

});

app.post('/location', bodyParser.json(), function (req, res) {
    const { lat, long, areaCode } = req.body;

    if (!lat || !long || !areaCode || parseInt(areaCode) < 0) {
        res.json({ 'message': 'Invalid body' })
        return;
    }

    connection.query(`CALL CREATE_LOCATION(${lat}, ${long}, ${areaCode})`, function (err, rows, fields) {
        if (err) {
            res.json({ 'message': 'Error' })
            return;
        }
        res.json(rows[0][0]);
    });

});

app.put('/location', bodyParser.json(), function (req, res) {
    const { locationId, lat, long, areaCode } = req.body;

    if (!locationId || isNaN(locationId) || !lat || !long || !areaCode || parseInt(areaCode) < 0) {
        res.json({ 'message': 'Invalid body' })
        return;
    }

    connection.query(`UPDATE Location SET lat=${lat}, \`long\`=${long}, areaCode=${areaCode} WHERE locationID=${locationId}`, function (err, rows, fields) {
        if (err) throw err;
        res.json(rows);
    });
});

app.delete('/location', function (req, res) {
    const { location_id } = req.query;

    if (!location_id || isNaN(location_id)) {
        res.json({ 'message': 'Invalid location_id' })
        return;
    }
    connection.query(`DELETE FROM Crime WHERE locationID=${location_id}`, function (err, rows, fields) {
        if (err) throw err;
        connection.query(`DELETE FROM Location WHERE locationID=${location_id}`, function (err, rows, fields) {
            if (err) throw err;
            res.json(rows);
        });
    });
});

app.listen(80, '0.0.0.0', function () {
    console.log('Node app is running on port 80');
});