/* 
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
package de.unisaarland.swan.rest.services.v1;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.unisaarland.swan.LoginUtil;
import de.unisaarland.swan.business.Service;
import de.unisaarland.swan.dao.SchemeDAO;
import de.unisaarland.swan.dao.UsersDAO;
import de.unisaarland.swan.entities.Scheme;
import de.unisaarland.swan.entities.Users;
import de.unisaarland.swan.rest.view.View;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.CreateException;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * The REST service responsible for schemes.
 *
 * @author Timo Guehring
 */
@Stateless
@Path("/scheme")
public class SchemeFacadeREST extends AbstractFacade<Scheme> {

    // Needed to write JSON with specific properties e.g. views
    private static ObjectMapper mapper = new ObjectMapper();

    @EJB
    Service service;
    
    @EJB
    UsersDAO usersDAO;
    
    @EJB
    SchemeDAO schemeDAO;
    

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    public Response create(Scheme entity) {

        try {
            LoginUtil.check(usersDAO.checkLogin(getSessionID(), Users.RoleType.projectmanager));
            service.process(entity);
            return schemeDAO.create(entity);
        } catch (SecurityException e) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } catch (CreateException ex) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

    }

    @DELETE
    @Path("{id}")
    public Response remove(@PathParam("id") Long id) {

        try {
            LoginUtil.check(usersDAO.checkLogin(getSessionID(), Users.RoleType.projectmanager));
            service.removeScheme(id);
            return Response.status(Response.Status.OK).build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } catch (CreateException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

    }

    @GET
    @Path("{docId}")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getSchemeByDocId(@PathParam("docId") Long docId) {

        try {
            LoginUtil.check(usersDAO.checkLogin(getSessionID()));

            Scheme scheme = schemeDAO.getSchemeByDocId(docId);

            return Response.ok(mapper.writerWithView(View.SchemeByDocId.class)
                                        .withRootName("scheme")
                                        .writeValueAsString(scheme))
                            .build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } catch (JsonProcessingException ex) {
            Logger.getLogger(SchemeFacadeREST.class.getName()).log(Level.SEVERE, null, ex);
            return Response.serverError().build();
        }
    }

    @GET
    @Path("/byid/{schemeId}")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getSchemeById(@PathParam("schemeId") Long schemeId) {

        try {
            LoginUtil.check(usersDAO.checkLogin(getSessionID()));

            Scheme scheme = schemeDAO.find(schemeId);

            return Response.ok(mapper.writerWithView(View.SchemeById.class)
                                        .withRootName("scheme")
                                        .writeValueAsString(scheme))
                            .build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } catch (JsonProcessingException ex) {
            Logger.getLogger(SchemeFacadeREST.class.getName()).log(Level.SEVERE, null, ex);
            return Response.serverError().build();
        }
    }

    @GET
    @Path("/schemes")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getSchemes() {

        try {
            LoginUtil.check(usersDAO.checkLogin(getSessionID()));

            List<Scheme> list = schemeDAO.findAll();

            return Response.ok(mapper.writerWithView(View.Schemes.class)
                                        .withRootName("schemes")
                                        .writeValueAsString(list))
                            .build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } catch (JsonProcessingException ex) {
            Logger.getLogger(SchemeFacadeREST.class.getName()).log(Level.SEVERE, null, ex);
            return Response.serverError().build();
        }
    }

}
