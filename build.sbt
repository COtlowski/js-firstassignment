name := """js-firstassignment"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.6"

libraryDependencies ++= Seq(
  anorm,
  jdbc,
  cache,
  ws,
  "mysql" % "mysql-connector-java" % "5.1.35",
  "com.jaroop" %% "play-test-helpers" % "1.0.6" % "test"
)

resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"
resolvers += Resolver.url("Jaroop Releases", url("https://jaroop-releases.s3.amazonaws.com"))(Resolver.ivyStylePatterns)
resolvers += Resolver.url("Jaroop Snapshots", url("https://jaroop-snapshots.s3.amazonaws.com"))(Resolver.ivyStylePatterns)
