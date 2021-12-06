// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const controllerURL = Cypress.env('controller_url');
const systemToken = Cypress.env('system_token');
let createdResources = [];

// Clean up on a 'before' hook to allow post-mortem analysis on individual tests.
beforeEach(function () {
    if (createdResources.length === 0) {
        return;
    }
    cy.log(`Cleaning ${createdResources.length} previously created resource(s)`);
    createdResources.forEach(function({suffix, uuid}) {
        // Don't fail when a resource isn't already there, some objects may have
        // been removed, directly or indirectly, from the test that created them.
        cy.deleteResource(systemToken, suffix, uuid, false);
    });
    createdResources = [];
});

Cypress.Commands.add(
    "doRequest", (method = 'GET', path = '', data = null, qs = null,
        token = systemToken, auth = false, followRedirect = true, failOnStatusCode = true) => {
    return cy.request({
        method: method,
        url: `${controllerURL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`,
        body: data,
        qs: auth ? qs : Object.assign({ api_token: token }, qs),
        auth: auth ? { bearer: `${token}` } : undefined,
        followRedirect: followRedirect,
        failOnStatusCode: failOnStatusCode
    });
});

Cypress.Commands.add(
    "getUser", (username, first_name = '', last_name = '', is_admin = false, is_active = true) => {
        // Create user if not already created
        return cy.doRequest('POST', '/auth/controller/callback', {
            auth_info: JSON.stringify({
                email: `${username}@example.local`,
                username: username,
                first_name: first_name,
                last_name: last_name,
                alternate_emails: []
            }),
            return_to: ',https://example.local'
        }, null, systemToken, true, false) // Don't follow redirects so we can catch the token
            .its('headers.location').as('location')
            // Get its token and set the account up as admin and/or active
            .then(function () {
                this.userToken = this.location.split("=")[1]
                assert.isString(this.userToken)
                return cy.doRequest('GET', '/arvados/v1/users', null, {
                    filters: `[["username", "=", "${username}"]]`
                })
                    .its('body.items.0')
                    .as('aUser')
                    .then(function () {
                        cy.doRequest('PUT', `/arvados/v1/users/${this.aUser.uuid}`, {
                            user: {
                                is_admin: is_admin,
                                is_active: is_active
                            }
                        })
                            .its('body')
                            .as('theUser')
                            .then(function () {
                                return { user: this.theUser, token: this.userToken };
                            })
                    })
            })
    }
)

Cypress.Commands.add(
    "createLink", (token, data) => {
        return cy.createResource(token, 'links', {
            link: JSON.stringify(data)
        })
    }
)

Cypress.Commands.add(
    "createGroup", (token, data) => {
        return cy.createResource(token, 'groups', {
            group: JSON.stringify(data),
            ensure_unique_name: true
        })
    }
)

Cypress.Commands.add(
    "trashGroup", (token, uuid) => {
        return cy.deleteResource(token, 'groups', uuid);
    }
)


Cypress.Commands.add(
    "createWorkflow", (token, data) => {
        return cy.createResource(token, 'workflows', {
            workflow: JSON.stringify(data),
            ensure_unique_name: true
        })
    }
)

Cypress.Commands.add(
    "createCollection", (token, data) => {
        return cy.createResource(token, 'collections', {
            collection: JSON.stringify(data),
            ensure_unique_name: true
        })
    }
)

Cypress.Commands.add(
    "updateCollection", (token, uuid, data) => {
        return cy.updateResource(token, 'collections', uuid, {
            collection: JSON.stringify(data)
        })
    }
)

Cypress.Commands.add(
    "createResource", (token, suffix, data) => {
        return cy.doRequest('POST', '/arvados/v1/' + suffix, data, null, token, true)
            .its('body').as('resource')
            .then(function () {
                createdResources.push({suffix, uuid: this.resource.uuid});
                return this.resource;
            })
    }
)

Cypress.Commands.add(
    "deleteResource", (token, suffix, uuid, failOnStatusCode = true) => {
        return cy.doRequest('DELETE', '/arvados/v1/' + suffix + '/' + uuid, null, null, token, false, true, failOnStatusCode)
            .its('body').as('resource')
            .then(function () {
                return this.resource;
            })
    }
)

Cypress.Commands.add(
    "updateResource", (token, suffix, uuid, data) => {
        return cy.doRequest('PUT', '/arvados/v1/' + suffix + '/' + uuid, data, null, token, true)
            .its('body').as('resource')
            .then(function () {
                return this.resource;
            })
    }
)

Cypress.Commands.add(
    "loginAs", (user) => {
        cy.clearCookies()
        cy.clearLocalStorage()
        cy.visit(`/token/?api_token=${user.token}`);
        cy.url({timeout: 10000}).should('contain', '/projects/');
        cy.get('div#root').should('contain', 'Arvados Workbench (zzzzz)');
        cy.get('div#root').should('not.contain', 'Your account is inactive');
    }
)

Cypress.Commands.add(
    "testEditProjectOrCollection", (container, oldName, newName, newDescription, isProject = true) => {
        cy.get(container).contains(oldName).rightclick();
        cy.get('[data-cy=context-menu]').contains(isProject ? 'Edit project' : 'Edit collection').click();
        cy.get('[data-cy=form-dialog]').within(() => {
            cy.get('input[name=name]').clear().type(newName);
            cy.get(isProject ? 'div[contenteditable=true]' : 'input[name=description]').clear().type(newDescription);
            cy.get('[data-cy=form-submit-btn]').click();
        });

        cy.get(container).contains(newName).rightclick();
        cy.get('[data-cy=context-menu]').contains(isProject ? 'Edit project' : 'Edit collection').click();
        cy.get('[data-cy=form-dialog]').within(() => {
            cy.get('input[name=name]').should('have.value', newName);

            if (isProject) {
                cy.get('span[data-text=true]').contains(newDescription);
            } else {
                cy.get('input[name=description]').should('have.value', newDescription);
            }

            cy.get('[data-cy=form-cancel-btn]').click();
        });
    }
)

Cypress.Commands.add(
    "doSearch", (searchTerm) => {
        cy.get('[data-cy=searchbar-input-field]').type(`{selectall}${searchTerm}{enter}`);
    }
)

Cypress.Commands.add(
    "goToPath", (path) => {
        return cy.window().its('appHistory').invoke('push', path);
    }
)

Cypress.Commands.add('getAll', (...elements) => {
    const promise = cy.wrap([], { log: false })

    for (let element of elements) {
        promise.then(arr => cy.get(element).then(got => cy.wrap([...arr, got])))
    }

    return promise
})

Cypress.Commands.add('shareWith', (srcUserToken, targetUserUUID, itemUUID, permission = 'can_write') => {
    cy.createLink(srcUserToken, {
        name: permission,
        link_class: 'permission',
        head_uuid: itemUUID,
        tail_uuid: targetUserUUID
    });
})

Cypress.Commands.add('addToFavorites', (userToken, userUUID, itemUUID) => {
    cy.createLink(userToken, {
        head_uuid: itemUUID,
        link_class: 'star',
        name: '',
        owner_uuid: userUUID,
        tail_uuid: userUUID,
    });
})

Cypress.Commands.add('createProject', ({
    owningUser,
    targetUser,
    projectName,
    canWrite,
    addToFavorites
}) => {
    const writePermission = canWrite ? 'can_write' : 'can_read';

    cy.createGroup(owningUser.token, {
        name: `${projectName} ${Math.floor(Math.random() * 999999)}`,
        group_class: 'project',
    }).as(`${projectName}`).then((project) => {
        if (targetUser && targetUser !== owningUser) {
            cy.shareWith(owningUser.token, targetUser.user.uuid, project.uuid, writePermission);
        }
        if (addToFavorites) {
            const user = targetUser ? targetUser : owningUser;
            cy.addToFavorites(user.token, user.user.uuid, project.uuid);
        }
    });
});

Cypress.Commands.add(
    'upload',
    {
        prevSubject: 'element',
    },
    (subject, file, fileName) => {
        cy.window().then(window => {
            const blob = b64toBlob(file, '', 512);
            const testFile = new window.File([blob], fileName);

            cy.wrap(subject).trigger('drop', {
                dataTransfer: { files: [testFile] },
            });
        })
    }
)

function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob
}