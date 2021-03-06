/*
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
'use strict';

angular
    .module('app')
    .controller('usersController', ['$rootScope', '$scope', '$http', '$window', '$uibModal', '$q', 'hotkeys',
        function ($rootScope, $scope, $http, $window, $uibModal, $q, hotkeys) {

            $rootScope.validateSignedInUser();
            $scope.isUnprivileged = $window.sessionStorage.isAnnotator;

            // Initialize user view
            $scope.init = function () {
                $scope.loaded = false;
				$scope.activeSearch = false;
                //Pop Up
                $scope.animationsEnabled = true;
                $scope.getUsers();

                if ($rootScope.tour !== undefined) {
                    $rootScope.tour.resume();
                }

            };

            // Request list of users from backend
            $scope.getUsers = function () {
                $http.get("swan/user").success(function (response) {
                    var res = JSOG.parse(JSON.stringify(response));
                    $scope.allUsers = res.users;
                    $scope.users = $scope.allUsers.slice();
                    /* TODO change this cruel code
                        it evokes for every user a single project and timelogging request
                    for (var i = 0; i < $scope.users.length; i++) {
                        $scope.enhanceUserData($scope.users[i], i);
                    }
                    */
                    $scope.loaded = true;
                }).error(function (response) {
                    $rootScope.checkResponseStatusCode(response.status);
                });
            };

			$scope.search = function (searchKeyword) {
				if (searchKeyword == undefined) {
					$rootScope.addAlert({type: 'warning', msg: 'Please enter at least three characters.'});
					return;
				}
				if (searchKeyword == "") {
					if ($scope.activeSearch) {
						$scope.activeSearch = false;
						$scope.searchKeyword = "";
						$scope.users = $scope.allUsers.slice();
					}
				} else {
					$scope.loaded = false;
					var lowerSearch = searchKeyword.toLowerCase();
					var res = [];

					for (var i = 0; i < $scope.allUsers.length; i++) {
						var user = $scope.allUsers[i];
						var fullName = user.prename.toLowerCase() + " " + user.lastname.toLowerCase();
						if (fullName.includes(lowerSearch) || user.email.toLowerCase().includes(lowerSearch)) {
							res.push(user);
						}
					}

					$scope.users = res;
					$scope.loaded = true;
					$scope.activeSearch = true;
					if (res.length == 0) {
						$rootScope.addAlert({msg: 'Sorry, there are no users matching your search.'});
					}
				}
			};

            $scope.isVisible = function (user) {
                return user.id == $window.sessionStorage.uId;
            };

            $scope.enhanceUserData = function (u, i) {
                var projReq = $http.get("swan/project/byuser/" + u.id).success(function (response) {
                    $scope.projects = JSOG.parse(JSON.stringify(response)).projects;
                }).error(function (response) {
                    $rootScope.checkResponseStatusCode(response.status);
                });
                var timeReq = $http.get("swan/timelogging/" + u.id).success(function (response) {
                    $scope.tilog = JSOG.parse(JSON.stringify(response)).timelogging;
                }).error(function (response) {
                    $rootScope.checkResponseStatusCode(response.status);
                });

                $q.all([projReq, timeReq]).then(function (ret, ret2) {
                    var dUndone = 0;
                    for (var k = 0; k < $scope.projects.length; k++) {
                        var proj = $scope.projects[k];
                        for (var j = 0; j < proj.documents.length; j++) {
                            var doc = proj.documents[j];
                            for (var t = 0; t < proj.users.length; t++) {
                                var state = doc.states[t]
                                if (u.id == state.user.id
                                        && !state.completed) {
                                    dUndone++;
                                }
                            }
                        }
                    }
                    var user = {
                        'id': u.id,
                        'prename': u.prename,
                        'lastname': u.lastname,
                        'role': u.role,
                        'email': u.email,
                        'loggedtime': $rootScope.calcTotalTime($scope.tilog),
                        'undone': dUndone
                    };
                    $scope.users[i] = user;
                    $scope.role = $window.sessionStorage.role;

                });
            };


            $scope.getLoggedTime = function (u) {

            };


            $scope.getUndonDocs = function (u) {

            };


            // *********************
            // Callbacks for Buttons
            // *********************

            hotkeys.bindTo($scope)
                    .add({
                        combo: '+',
                        description: 'Adding a new User',
                        callback: function () {
                            $scope.open();
                        }
                    });

            hotkeys.bindTo($scope)
                    .add({
                        combo: '+',
                        description: 'Adding a new User',
                        callback: function () {
                            $scope.open();
                        }
                    });

            hotkeys.bindTo($scope)
                    .add({
                        combo: '+',
                        description: 'Adding a new User',
                        callback: function () {
                            $scope.open();
                        }
                    });

            // Function to open modal
            $scope.openUserAddModal = function (size) {

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'templates/users/userAddModal.html',
                    controller: 'userAddModalController',
                    size: size
                });
                // Callback on Submit
                modalInstance.result.then(function (response) {
                    $scope.users.push(response);
					$scope.allUsers.push(response);

                    // Check if the guided tour can continue
                    if ($rootScope.tour !== undefined) {
                        if (response.role === 'annotator') {
                            $("#tour-next-button").prop("disabled", false);
                        }
                    }
                });
                $scope.toggleAnimation = function () {
                    $scope.animationsEnabled = !$scope.animationsEnabled;
                };
            };

            $scope.openUserDeleteModal = function (userDeleteId) {
                $rootScope.userDeleteId = userDeleteId;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'templates/users/userDeleteModal.html',
                    controller: 'userDeleteModalController'
                });

                modalInstance.result.then(function (response) {
                	$scope.users = $scope.allUsers.slice();
                    for (var i = 0; i < $scope.users.length; i++) {
                        if ($scope.users[i].id === response) {
                            $scope.users.splice(i, 1);
							$scope.allUsers.splice(i, 1);
                        }
                    }
                });
                $scope.toggleAnimation = function () {
                    $scope.animationsEnabled = !$scope.animationsEnabled;
                };
            };

            $scope.openUserEditModal = function (userID) {
                $rootScope.toEdit = userID;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'templates/users/userEditModal.html',
                    controller: 'userEditModalController'
                });

                $scope.toggleAnimation = function () {
                    $scope.animationsEnabled = !$scope.animationsEnabled;
                };
            };

            // Initialize View
            $scope.init();

        }
    ]);

