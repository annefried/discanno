/* 
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
package de.unisaarland.swan.test;

import de.unisaarland.swan.Utility;
import de.unisaarland.swan.business.Service;
import de.unisaarland.swan.entities.*;

import java.util.List;
import java.util.Set;
import javax.ejb.CreateException;

import edu.stanford.nlp.ie.machinereading.structure.Span;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Before;

/**
 *
 * @author Timo Guehring
 */
public class ProjectsTest extends BaseTest {
    
    Service service = new Service();
    
    @Before
    public void configureService() {
        super.configureService(service);
    }
    
    /** TOOD */
    //@Test
    public void testScenario1() throws CloneNotSupportedException, CreateException {
        
        // Create scheme
        Scheme scheme = TestDataProvider.getScheme1();
        service.process(scheme);
        persistAndFlush(scheme);

        // Create user
        Users user = TestDataProvider.getAdmin();
        persistAndFlush(user);
        
        // Create project and set scheme
        Project project = TestDataProvider.getProject1();
        project.getScheme().setId(scheme.getId());
        service.process(project);
        persistAndFlush(project);
        
        Users retUser = em.find(Users.class, user.getId());
        assertNotNull(retUser);
        assertTrue(retUser.getPrename().equals("John"));
        assertTrue(retUser.getLastname().equals("Locke"));
        assertTrue(retUser.getPassword().equals(Utility.hashPassword("secret")));
        assertTrue(retUser.getRole().equals(Users.RoleType.admin));
        assertTrue(retUser.getEmail().equals("admin@web.de"));
        assertTrue(retUser.getManagingProjects().isEmpty());
        assertTrue(retUser.getProjects().isEmpty());
        assertTrue(retUser.getSession() == null
                    || retUser.getSession().equals(""));
        
        // Add user to project
        service.addUserToProject(project.getId(), retUser.getId());
        
        assertTrue(retUser.getProjects().size() == 1);
        assertTrue(retUser.getManagingProjects().isEmpty());
        
        // Add document to project
        Document doc = TestDataProvider.getDocument1();
        doc.setProject(project);
        service.process(doc);
        persistAndFlush(doc);
        
        Document retDoc = em.find(Document.class, doc.getId());
        assertNotNull(retDoc);
        assertTrue(retDoc.getName().equals("Politics1"));
        assertTrue(retDoc.getText().equals(TestDataProvider.TEXT_1));
        assertTrue(retDoc.getDefaultAnnotations().isEmpty());
        assertTrue(retDoc.getProject().getId().equals(project.getId()));
        assertTrue(retDoc.getStates().isEmpty());
        
        service.addDocumentToProject(retDoc);
        assertTrue(retDoc.getStates().size() == 1);
        
        Object[] states = retDoc.getStates().toArray();
        State state = (State) states[0];
        assertNotNull(state);
        assertFalse(state.isCompleted());
        assertTrue(state.getDocument().getId().equals(retDoc.getId()));
        assertNotNull(state.getLastEdit());
        assertTrue(state.getUser().getId().equals(retUser.getId()));
        
        testAnnotationsAndLinks(retDoc,
                                retUser,
                                scheme.getLabelSets().get(0),
                                scheme.getLinkTypes().get(0));
    }
    
    public void testAnnotationsAndLinks(Document doc, Users user, LabelSet labelSet, LinkType linkType)
            throws CloneNotSupportedException, CreateException {
        
        Annotation anno1 = testAddAnnotation1(doc, user, labelSet);
        Annotation anno2 = testAddAnnotation2(doc, user, labelSet);
        testAddMultipleAnnotations(doc, user, labelSet);
        testAddLink(doc, user, linkType, anno1, anno2);
    }
    
    public Annotation testAddAnnotation1(Document doc, Users user, LabelSet labelSet) throws CloneNotSupportedException, CreateException {
        
        Annotation anno = TestDataProvider.getAnnotation1();

        SpanType spanType = anno.getSpanType();
        persistAndFlush(spanType);
        anno.setSpanType(spanType);

        anno.setUser(user);
        anno.setDocument(doc);
        service.process(anno);
        persistAndFlush(anno);
        
        Annotation retAnno = em.find(Annotation.class, anno.getId());
        assertNotNull(retAnno);
        assertFalse(retAnno.isNotSure());
        assertTrue(retAnno.getText().equals("The"));
        assertTrue(retAnno.getDocument().getId().equals(doc.getId()));
        assertTrue(retAnno.getUser().getId().equals(user.getId()));
        assertTrue(retAnno.getStart() == 0);
        assertTrue(retAnno.getEnd() == 3);
        assertTrue(retAnno.getLabels().isEmpty());
        assertTrue(retAnno.getSpanType().getName().equals("verb"));
        
        // Add label to annotation 1
        Label label = TestDataProvider.getLabel1();
        label.setLabelSet(labelSet);
        persistAndFlush(label);
        service.addLabelToAnnotation(retAnno.getId(), label);
        
        Set<Label> labels = retAnno.getLabels();
        Object[] labelsArr = labels.toArray();
        Label newLabel = (Label) labelsArr[0];
        
        assertTrue(labels.size() == 1);
        assertTrue(newLabel.getName().equals(label.getName()));
        
        // Test broken labels
        try {
            Label labelBroken = TestDataProvider.getLabel1();
            service.addLabelToAnnotation(retAnno.getId(), labelBroken);
            fail("No IllegalArgumentException");
        } catch (CreateException e) {
            assertTrue(e.getMessage()
                    .equals("Service: Adding Label to Annotation failed"));
        }
        
        return anno;
    }
    
    public Annotation testAddAnnotation2(Document doc, Users user, LabelSet labelSet) throws CloneNotSupportedException, CreateException {
        
        Annotation anno = TestDataProvider.getAnnotation2();

        SpanType spanType = anno.getSpanType();
        persistAndFlush(spanType);
        anno.setSpanType(spanType);

        anno.setUser(user);
        anno.setDocument(doc);
        service.process(anno);
        persistAndFlush(anno);
        
        Annotation retAnno = em.find(Annotation.class, anno.getId());
        assertNotNull(retAnno);
        assertTrue(retAnno.isNotSure());
        assertTrue(retAnno.getText().equals("the"));
        assertTrue(retAnno.getDocument().getId().equals(doc.getId()));
        assertTrue(retAnno.getUser().getId().equals(user.getId()));
        assertTrue(retAnno.getStart() == 65);
        assertTrue(retAnno.getEnd() == 68);
        assertTrue(retAnno.getLabels().isEmpty());
        assertTrue(retAnno.getSpanType().getName().equals("passage"));
        
        // Add label to annotation 1
        Label label = TestDataProvider.getLabel1();
        label.setLabelSet(labelSet);
        persistAndFlush(label);
        service.addLabelToAnnotation(retAnno.getId(), label);
        
        Set<Label> labels = retAnno.getLabels();
        Object[] labelArr = labels.toArray();
        Label newLabel = (Label) labelArr[0];
        
        assertTrue(labels.size() == 1);
        assertTrue(newLabel.getName().equals(label.getName()));
        
        return anno;
    }

    public void testAddMultipleAnnotations(Document doc, Users user, LabelSet labelSet) throws CreateException {

        List<Annotation> annos = TestDataProvider.getAnnotations();
        
        for (Annotation anno : annos) {
            SpanType spanType = anno.getSpanType();
            persistAndFlush(spanType);
            anno.setSpanType(spanType);

            anno.setUser(user);
            anno.setDocument(doc);
            service.process(anno);
            persistAndFlush(anno);
        }
        
        List<Annotation> retAnnos = findAll(Annotation.class);
        assertTrue(retAnnos.size() == annos.size() + 2);
    }

    private void testAddLink(Document doc, Users user, LinkType linkType, Annotation anno1, Annotation anno2) throws CreateException {

        Link link = new Link();
        link.setAnnotation1(anno1);
        link.setAnnotation2(anno2);
        link.setDocument(doc);
        link.setUser(user);

        service.process(link);
        persistAndFlush(link);
        
        Link retLink = em.find(Link.class, link.getId());
        assertNotNull(retLink);
        assertTrue(retLink.getAnnotation1().getId().equals(anno1.getId()));
        assertTrue(retLink.getAnnotation2().getId().equals(anno2.getId()));
        assertTrue(retLink.getLinkLabels().isEmpty());
        assertTrue(retLink.getUser().getId().equals(user.getId()));
        assertTrue(retLink.getDocument().getId().equals(doc.getId()));
        
        // Add label to link
        LinkLabel label = TestDataProvider.getLinkLabel1();
        label.setLinkType(linkType);
        persistAndFlush(label);
        service.addLinkLabelToLink(retLink.getId(), label);
        
        Set<LinkLabel> labels = retLink.getLinkLabels();
        Object[] labelArr = labels.toArray();
        LinkLabel newLabel = (LinkLabel) labelArr[0];
        
        assertTrue(labels.size() == 1);
        assertTrue(newLabel.getName().equals(label.getName()));
        
        // Test broken label
        try {
            LinkLabel labelBroken = TestDataProvider.getLinkLabel1();
            service.addLinkLabelToLink(retLink.getId(), labelBroken);
            fail("No IllegalArgumentException");
        } catch (CreateException e) {
            assertTrue(e.getMessage()
                    .equals("Service: Adding LinkLabel to Link failed."));
        }

    }
    
}
