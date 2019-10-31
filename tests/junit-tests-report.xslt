<?xml version="1.0" encoding="UTF-8"?>
<!--
Add the following processing instruction to the top of the junit.xml output file
so that a browser will use the this xslt stylesheet to render the xml.
(firefox will work if you go to config:about and set privacy.file_unique_origin to false)
<?xml-stylesheet type="text/xsl" href="junit-tests-report.xslt" ?>
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns="http://www.w3.org/1999/xhtml">

  <xsl:output method="xml"
        encoding="UTF-8"
        doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
        doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"
        indent="yes" />

  <xsl:template match="/">
    <!--!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"-->
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

      <head>
        <meta http-equiv="Content-Language" content="en-us" />
        <meta http-equiv="Content-Type" content="text/html; charset=windows-1252" />
        <meta http-equiv="Content-Script-Type" content="text/javascript" />
        <meta name="Author" content="Michael Jay Lippert" />
        <meta name="Owner" content="Michael Jay Lippert" />
        <meta name="Copyright" content="Copyright (c) 2019 Michael Jay Lippert, All rights reserved." />
        <!--link rel="stylesheet" type="text/css" href="theme/theme.css" /-->

        <style type="text/css">
          h1
          {
            text-align: center;
            background-color: rgb(235, 235, 235);
          }

          h2
          {
            margin-top: 2em;
            background-color: rgb(235, 235, 235);
          }

          pre
          {
            font-size: 95%;
            text-align: left;
          }

          table
          {
            border-collapse: collapse;
            border: 2px solid rgb(200, 200, 200);
            letter-spacing: 1px;
            font-family: sans-serif;
            font-size: .8rem;
          }

          td,
          th
          {
            border: 1px solid rgb(190, 190, 190);
            padding: 7px 5px;
          }

          th
          {
            background-color: rgb(235, 235, 235);
          }

          span.test-count,
          span.fail-count
          {
            font-weight: bold;
          }

          table.suite-summary
          {
            margin-bottom: 1rem;
          }

          table.suite-summary td
          {
            text-align: center;
          }

          tr.pass > td.status
          {
            color: white;
            background-color: green;
          }

          tr.fail > td.status
          {
            color: white;
            background-color: darkred;
          }

          tr.fail > td.test
          {
            background-color: seashell;
          }

          tr.fail > td.test > div.name
          {
            color: darkred;
          }

          tr.skip > td.status
          {
            background-color: gold;
          }

          tr.skip > td.test > div.name
          {
            color: dimgrey;
          }

          tr.error > td.status
          {
            color: white;
            background-color: crimson;
          }
        </style>

        <title>
          <xsl:choose>
            <xsl:when test="/testsuites">
              <xsl:value-of select="/testsuites/@name"/>
            </xsl:when>
            <xsl:when test="/testsuite">
              <xsl:value-of select="/testsuite/@name"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:text>Generated Report Title</xsl:text>
            </xsl:otherwise>
          </xsl:choose>
        </title>
      </head>

      <xsl:apply-templates/>

    </html>
  </xsl:template>

  <xsl:template match="testcase">
    <xsl:variable name="suite-name"><xsl:value-of select="../@name"/></xsl:variable>
    <xsl:variable name="status-class">
      <xsl:choose>
        <xsl:when test="failure">
          <xsl:text>fail</xsl:text>
        </xsl:when>
        <xsl:when test="skipped">
          <xsl:text>skip</xsl:text>
        </xsl:when>
        <xsl:when test="error">
          <xsl:text>error</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>pass</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="status-display">
      <xsl:choose>
        <xsl:when test="failure">
          <xsl:text>Failed</xsl:text>
        </xsl:when>
        <xsl:when test="skipped">
          <xsl:text>Skipped</xsl:text>
        </xsl:when>
        <xsl:when test="error">
          <xsl:text>Error</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>Passed</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <tr>
      <xsl:attribute name="class"><xsl:value-of select="$status-class"/></xsl:attribute>
      <td class="status"><xsl:value-of select="$status-display"/></td>
      <td class="test">
        <div class="name"><xsl:value-of select="substring-after(@name, $suite-name)"/></div>
        <xsl:apply-templates select="./*"/>
      </td>
      <td class="time"><xsl:value-of select="@time"/></td>
    </tr>
  </xsl:template>

  <xsl:template match="testcase/failure">
    <pre>
      <xsl:value-of select="."/>
    </pre>
  </xsl:template>

  <xsl:template match="testsuites">
    <h1><xsl:value-of select="@name"/></h1>
    <p>
      Ran <span class="test-count"><xsl:value-of select="@tests"/> tests</span>
      in <xsl:value-of select="@time"/> seconds.
      <span class="fail-count"><xsl:value-of select="@failures"/> failed</span>.
    </p>

    <xsl:apply-templates select="testsuite">
        <xsl:sort select="@name"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="testsuite">
    <h2><xsl:value-of select="@name"/></h2>
    <table class="suite-summary">
      <tbody>
        <tr>
          <td colspan="8">
            <div class="suite-summary">
              Ran <span class="test-count"><xsl:value-of select="@tests"/> tests</span>
              on <xsl:value-of select="@timestamp"/> taking <xsl:value-of select="@time"/> seconds
            </div>
          </td>
        </tr>
        <tr>
          <td></td>
          <th>failures</th><td><xsl:value-of select="@failures"/></td>
          <th>skipped</th><td><xsl:value-of select="@skipped"/></td>
          <th>errors</th><td><xsl:value-of select="@errors"/></td>
          <th></th>
        </tr>
      </tbody>
    </table>
    <xsl:apply-templates select="system-out" />
    <xsl:apply-templates select="system-err" />
    <hr/>
    <xsl:apply-templates select="testcase" />
  </xsl:template>

  <xsl:template match="system-out">
    <xsl:text>
    ------ Standard output ------
    </xsl:text>
    <xsl:value-of select="." />
  </xsl:template>

  <xsl:template match="system-err">
    <xsl:text>
    ------ Error output ------
    </xsl:text>
    <xsl:value-of select="." />
  </xsl:template>

</xsl:stylesheet>
