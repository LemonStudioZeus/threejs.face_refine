THREE.face_refine = function (geometry, vectors) {

        var planes = [];

        //getPlanes(vectors);

        for (var i = 0, l = vectors.length; i < l; i += 2) {

            getCutPlane(vectors[i], vectors[i + 1]);
        }


        geometry.computeFaceNormals();

        var polygons = [];

        var f, f1, face;
        for (f = 0, fl = geometry.faces.length; f < fl; f++) {

            face = geometry.faces[f];
            // Triangle ABC
            var vA = geometry.vertices[face.a];
            var vB = geometry.vertices[face.b];
            var vC = geometry.vertices[face.c];

            var _v = [];

            var dir = new _CSG.Vector(face.normal.x, face.normal.y, face.normal.z);

            _v.push(new _CSG.Vertex(new _CSG.Vector(vA.x, vA.y, vA.z), dir));
            _v.push(new _CSG.Vertex(new _CSG.Vector(vB.x, vB.y, vB.z), dir));
            _v.push(new _CSG.Vertex(new _CSG.Vector(vC.x, vC.y, vC.z), dir));


            polygons.push(new _CSG.Polygon(_v));

        }

        for (var p = 0; p < planes.length; p++) {
            var plane = planes[p];

            var front = [],
                back = [],
                coplanPoly = [];
            for (var i = 0; i < polygons.length; i++) {
                plane.splitPolygon(polygons[i], coplanPoly, coplanPoly, front, back);
            }

            polygons = [];
            polygons = polygons.concat(front);
            polygons = polygons.concat(back);

        }

        var vertices = [];
        var faces = [];
        for (var i = 0; i < polygons.length; i++) {

            var polygon = polygons[i];


            var offset = vertices.length;

            for (var j = 0; j < polygon.vertices.length; j++) {
                var v = polygon.vertices[j].pos;

                vertices.push(new _THREE.Vector3(v.x, v.y, v.z));
            }

            var vertIndices = [];
            if (polygon.vertices.length == 3) {

                vertIndices.push([0, 1, 2]);
            } else {
                vertIndices = polygon2tri(polygon);
            }

            for (var j = 0; j < vertIndices.length; j++) {
                var a = vertIndices[j][0];
                var b = vertIndices[j][1];
                var c = vertIndices[j][2];

                var p = _CSG.Plane.fromPoints(polygon.vertices[a].pos, polygon.vertices[b].pos, polygon.vertices[c].pos);
                if (polygon.plane.normal.dot(p.normal) < 0) {
                    var d = a;
                    a = c;
                    c = d;
                }

                var face = new _THREE.Face3(a + offset, b + offset, c + offset);

                faces.push(face);
            }

        }


        var geometry_new = new _THREE.Geometry();
        geometry_new.vertices = vertices;
        geometry_new.faces = faces;

        geometry_new.mergeVertices();

        geometry_new.computeFaceNormals();
        geometry_new.computeVertexNormals();

        return geometry_new;

        function getCutPlane(normal, point) {

            var plane = new _CSG.Plane(normal, normal.dot(point));

            planes.push(plane);

        }


        function polygon2tri(polygon) {

            var abs_x = Math.abs(polygon.plane.normal.x);
            var abs_y = Math.abs(polygon.plane.normal.y);
            var abs_z = Math.abs(polygon.plane.normal.z);

            var b = 0;
            if (abs_x >= abs_y && abs_x >= abs_z) {
                b = 0;
            } else if (abs_y >= abs_x && abs_y >= abs_z) {
                b = 1;
            } else {
                b = 2;
            }

            var contour = [];

            for (var i = 0; i < polygon.vertices.length; i++) {
                var v3 = polygon.vertices[i].pos;
                var v;
                if (b == 0) {
                    v = new _THREE.Vector2(v3.y, v3.z);

                } else if (b == 1) {
                    v = new _THREE.Vector2(v3.x, v3.z);
                } else {
                    v = new _THREE.Vector2(v3.x, v3.y);
                }

                contour.push(v);
            }

            var vertIndices = _THREE.FontUtils.Triangulate(contour, true); //vertIndices

            return vertIndices;
        }
    };
