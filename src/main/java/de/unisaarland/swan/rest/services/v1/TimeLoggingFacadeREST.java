/* 
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
package de.unisaarland.swan.rest.services.v1;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.unisaarland.swan.LoginUtil;
import de.unisaarland.swan.business.Service;
import de.unisaarland.swan.dao.TimeLoggingDAO;
import de.unisaarland.swan.dao.UsersDAO;
import de.unisaarland.swan.entities.TimeLogging;
import de.unisaarland.swan.rest.view.View;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.CreateException;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.NoResultException;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * The REST service responsible for timelogging.
 *
 * @author Timo Guehring
 */
@Stateless
@Path("/timelogging")
public class TimeLoggingFacadeREST extends AbstractFacade<TimeLogging> {

    // Needed to write JSON with specific properties e.g. views
    private static ObjectMapper mapper = new ObjectMapper();

    @EJB
    Service service;
    
    @EJB
    UsersDAO usersDAO;
    
    @EJB
    TimeLoggingDAO timeLoggingDAO;
    

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    public Response create(TimeLogging entity) {

        try {
            LoginUtil.check(usersDAO.checkLogin(getSessionID()));
            service.process(entity);
            return usersDAO.create(entity);
        } catch (SecurityException e) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } catch (CreateException ex) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

    }

    @GET
    @Path("{id}")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getTimeLoggingByUserId(@PathParam("id") Long id) {

        try {
            LoginUtil.check(usersDAO.checkLogin(getSessionID()));

            List<TimeLogging> list = timeLoggingDAO.getAllTimeLoggingByUserId(id);

            return Response.ok(mapper.writerWithView(View.Timelogging.class)
                                        .withRootName("timelogging")
                                        .writeValueAsString(list))
                            .build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } catch (NoResultException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        } catch (JsonProcessingException ex) {
            Logger.getLogger(UserFacadeREST.class.getName()).log(Level.SEVERE, null, ex);
            return Response.serverError().build();
        }
        
    }

}
